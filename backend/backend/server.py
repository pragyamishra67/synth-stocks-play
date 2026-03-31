# backend/server.py

from fastapi import FastAPI, WebSocket
import asyncio
import json
import time
import os
import sys
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# -------- LOAD ENV --------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
load_dotenv(os.path.join(BASE_DIR, ".env"))

API_KEYS = []
for key_name in ["GEMINI_API_KEY", "GEMINI_API_KEY1", "GEMINI_API_KEY2"]:
    val = os.getenv(key_name)
    if val:
        API_KEYS.append(val)

if not API_KEYS:
    raise ValueError("❌ No GEMINI_API_KEY found in .env")


# -------- IMPORT YOUR SYSTEM --------
from market_engine import MarketEngine
from candle_engine import CandleEngine
from event_engine import EventEngine
from news_engine import NewsEngine, news_to_event
from state import state
from csv_loader import load_csv_history
from analytics.pattern_engine import PatternEngine
from analytics.risk_engine import RiskEngine

# -------- INITIALIZE SYSTEM --------
event_engine = EventEngine(state.sector_map)
engine = MarketEngine(state, event_engine)
candle_engine = CandleEngine()
news_engine = NewsEngine(API_KEYS)
pattern_engine = PatternEngine()
risk_engine = RiskEngine()
clients = []


# -------- BROADCAST FUNCTION --------
async def broadcast(data):
    for client in clients:
        await client.send_text(json.dumps(data))


# -------- LIFESPAN AND SIMULATION LOOP --------
@asynccontextmanager
async def lifespan(app: FastAPI):

    # Initialize CSV history
    load_csv_history()

    async def loop():
        last_news_time = 0

        while True:
            # -------- MARKET UPDATE --------
            engine.generate_tick(candle_engine)

            # -------- EVENT CLEANUP --------
            event_engine.cleanup()

            # -------- BROADCAST ANALYTICS --------
            for stock in state.stock_prices:
                pattern = pattern_engine.detect(stock)
                risk_reward = risk_engine.get_ratio(stock)
                await broadcast({
                    "type": "analytics",
                    "stock": stock,
                    "pattern": pattern,
                    "riskReward": risk_reward,
                    "time": time.time()
                })

            # -------- SEND TICK DATA --------
            for stock, price in state.stock_prices.items():
                await broadcast({
                    "type": "tick",
                    "stock": stock,
                    "price": price,
                    "time": time.time()
                })

            # -------- SEND CANDLE DATA --------
            for stock in state.stock_prices:
                if state.candle_data[stock]:
                    candle = state.candle_data[stock][-1]

                    await broadcast({
                        "type": "candle",
                        "stock": stock,
                        "open": candle["open"],
                        "high": candle["high"],
                        "low": candle["low"],
                        "close": candle["close"],
                        "volume": candle["volume"],
                        "time": int(time.time())
                    })

            # -------- NEWS GENERATION --------
            current_time = time.time()

            if current_time - last_news_time > 600: # 10 minutes interval

                news_list = news_engine.generate_news()

                if news_list and isinstance(news_list, list):
                    valid_news = []
                    for news in news_list[:4]: # we only take 4
                        if news_engine.validate(news):
                            event = news_to_event(news)
                            event_engine.add_event(event)
                            valid_news.append({
                                "headline": news["headline"],
                                "target": news["target"]
                            })

                    if valid_news:
                        await broadcast({
                            "type": "news_batch",
                            "news": valid_news,
                            "time": current_time
                        })

                last_news_time = time.time()

            # -------- LOOP DELAY --------
            await asyncio.sleep(1)

    task = asyncio.create_task(loop())
    yield
    task.cancel()


# -------- APP INIT --------
app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------- WEBSOCKET ENDPOINT --------
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    clients.append(ws)

    # SEND HISTORY ON CONNECTION
    for stock in state.stock_prices:
        if state.candle_data[stock]:
            # we want to send the entire list as history
            await ws.send_text(json.dumps({
                "type": "history",
                "stock": stock,
                "data": state.candle_data[stock]
            }))

    try:
        while True:
            await asyncio.sleep(1)
    except:
        clients.remove(ws)


# -------- ENTRY POINT --------
if __name__ == "__main__":
    uvicorn.run("server:app", host="localhost", port=8080, reload=True)
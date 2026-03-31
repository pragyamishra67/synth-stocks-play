import os
import pandas as pd
import time
from state import state

def load_csv_history():
    print("Loading CSV history...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "real_stock_data")
    
    mapping = {
        "TCS": "TCS.csv",
        "INFY": "Infosys.csv",
        "HDFCBANK": "HDFC_Bank.csv",
        "MARUTI": "Maruti_Suzuki.csv"
    }

    # Configuration for initial history
    num_candles = 100
    candle_time_interval = 5 # 5 sec candles
    now = time.time()
    
    for stock, filename in mapping.items():
        path = os.path.join(data_dir, filename)
        if not os.path.exists(path):
            print(f"⚠️ CSV missing: {path}")
            continue

        try:
            # yfinance creates skipping headers
            # Row 4 has real data: Date, Close, High, Low, Open, Volume
            df = pd.read_csv(path, skiprows=3, names=['Date', 'Close', 'High', 'Low', 'Open', 'Volume'])
            df = df.dropna()
            
            # Take closing data
            history_rows = df.tail(num_candles).copy()
            
            # Timestamp generation ensuring end matches near time.time()
            start_time = now - (len(history_rows) * candle_time_interval)
            
            candle_list = []
            
            for idx, row in enumerate(history_rows.itertuples()):
                candle_time = start_time + (idx * candle_time_interval)
                c_open = max(float(row.Open), 1)
                c_high = max(float(row.High), 1)
                c_low = max(float(row.Low), 1)
                c_close = max(float(row.Close), 1)
                
                candle = {
                    "open": float(row.Open),
                    "high": float(row.High),
                    "low": float(row.Low),
                    "close": float(row.Close),
                    "volume": float(row.Volume) if pd.notna(row.Volume) else 1000,
                    "ticks": 10,  # Faked ticks
                    "time": int(candle_time)
                }
                candle_list.append(candle)
            
            if len(candle_list) > 0:
                state.candle_data[stock] = candle_list
                last_close = candle_list[-1]["close"]
                
                # Base prices updated properly
                state.stock_prices[stock] = last_close
                state.base_prices[stock] = last_close
                print(f"✅ Indexed {len(candle_list)} historical candles for {stock}. Ending Price: {last_close:.2f}")

        except Exception as e:
            print(f"❌ Error indexing CSV for {stock}: {e}")

    print("✅ CSV History Loaded successfully!")

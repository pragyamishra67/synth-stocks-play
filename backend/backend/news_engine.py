import time
import json
import re
from google import genai
from event_engine import MarketEvent   # ✅ ADD THIS


class NewsEngine:

    def __init__(self, api_keys):
        self.api_keys = api_keys if isinstance(api_keys, list) else [api_keys]
        self.current_idx = 0
        self._init_client()

    def _init_client(self):
        self.client = genai.Client(api_key=self.api_keys[self.current_idx])

    # -------- MAIN FUNCTION --------
    def generate_news(self):

        prompt = self._build_prompt()

        max_attempts = max(3, len(self.api_keys) + 1)
        for attempt in range(max_attempts):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )

                raw_text = (response.text or "").strip()

                if not raw_text:
                    return None

                parsed = self._safe_parse(raw_text)

                # Return list directly (even if some fail validation at this stage, server.py drops invalid ones)
                if isinstance(parsed, list):
                    return parsed
                else:
                    # In case LLM still returns single dict, wrap in list
                    if isinstance(parsed, dict):
                        return [parsed]
                    return None

            except Exception as e:

                if "429" in str(e):
                    self.current_idx = (self.current_idx + 1) % len(self.api_keys)
                    self._init_client()
                    time.sleep(1)
                    continue
                else:
                    time.sleep(1)

        return None

    # -------- PROMPT --------
    def _build_prompt(self):
        return """
Generate 4 realistic financial market news events affecting India's stock sectors.

STRICT RULES:
- Output ONLY a valid JSON Array containing EXACTLY 4 objects.
- No explanation
- No markdown
- No extra text

JSON FORMAT:
[
  {
    "headline": string,
    "sentiment": float between -1 and 1,
    "impact": float between 0.3 and 1,
    "target": one of ["IT", "BANK", "AUTO"],
    "duration": integer between 600 and 1800,
    "volume_spike": float between 0.2 and 1
  },
  ... (3 more objects like above)
]
"""

    # -------- SAFE PARSE --------
    def _safe_parse(self, text):

        try:
            return json.loads(text)
        except:
            pass

        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                return None

        return None

    # -------- VALIDATION --------
    def validate(self, data):

        if not data:
            return False

        if "headline" not in data or "sentiment" not in data or "target" not in data:
            return False

        data.setdefault("impact", 0.3)
        data.setdefault("duration", 30)
        data.setdefault("volume_spike", 0.2)

        return True


# -------- CONVERTER (FIXED) --------
def news_to_event(news):

    # ✅ Clamp values (VERY IMPORTANT)
    sentiment = max(min(news.get("sentiment", 0), 1), -1)
    impact = min(max(news.get("impact", 0.5), 0), 1)
    duration = max(300, news.get("duration", 1200)) # Default long living effect 20 mins!
    volume_spike = min(max(news.get("volume_spike", 0.3), 0), 1)

    # ✅ RETURN OBJECT, NOT DICT
    return MarketEvent(
        sentiment=sentiment,
        impact=impact,
        duration=duration,
        target=news.get("target", "IT"),
        volume_spike=volume_spike
    )
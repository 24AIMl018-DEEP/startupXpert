from pytrends.request import TrendReq


class TrendsCollector:

    def __init__(self):
        self.pytrends = TrendReq()

    def collect(self, keyword):
        try:
            self.pytrends.build_payload([keyword])
            data = self.pytrends.interest_over_time()

            if data.empty:
                return {"trend_score": 0}

            return {"trend_score": round(float(data[keyword].mean()), 2)}

        except Exception as e:
            print(f"Trend Error: {e}")
            return {"trend_score": 0}

FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY AI-VAL-MOD/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY AI-VAL-MOD/ .

# MODULE=roadmap → Roadmap-Module | anything else → Validation-Module
CMD ["/bin/sh", "-c", \
  "if [ \"$MODULE\" = \"roadmap\" ]; then \
    cd /app/Roadmap-Module/app && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1; \
  else \
    cd /app/Validation-Module/app && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1; \
  fi"]

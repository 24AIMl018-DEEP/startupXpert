FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Roadmap uses lightweight deps only — no torch/sentence-transformers
COPY AI-VAL-MOD/requirements-roadmap.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-roadmap.txt

# Copy all source code
COPY AI-VAL-MOD/ .

CMD ["/bin/sh", "-c", "if [ \"$MODULE\" = \"roadmap\" ]; then cd Roadmap-Module/app && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1; else cd Validation-Module/app && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1; fi"]

FROM python:3.11-slim

# System deps for sentence-transformers, lxml, scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY . .

# Railway injects PORT and MODULE at runtime
# MODULE=roadmap → Roadmap-Module, anything else → Validation-Module
CMD sh -c 'if [ "$MODULE" = "roadmap" ]; then \
    cd Roadmap-Module/app && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1; \
  else \
    cd Validation-Module/app && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1; \
  fi'

FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

FROM python:3.11-slim

RUN groupadd -r apiuser && useradd -r -g apiuser apiuser

WORKDIR /app

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

COPY . .
RUN chown -R apiuser:apiuser /app

USER apiuser

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

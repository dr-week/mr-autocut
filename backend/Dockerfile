FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir uv
WORKDIR /app
COPY pyproject.toml uv.lock* ./
COPY mr_autocut ./mr_autocut
RUN uv sync --no-dev
EXPOSE 7860
CMD ["uv", "run", "uvicorn", "mr_autocut.server:app", "--host", "0.0.0.0", "--port", "7860"]

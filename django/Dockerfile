FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get -y install gettext build-essential python3-dev libffi-dev

COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel

RUN pip install -r requirements.txt --no-cache-dir


COPY . .

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["0.0.0.0:8000"]

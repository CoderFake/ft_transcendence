FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get -y install gettext build-essential python3-dev libffi-dev

COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel

RUN pip install -r requirements.txt --no-cache-dir


COPY . .

CMD ["sh", "-c", "python manage.py makemigrations chat games profiles notice && python manage.py migrate && python manage.py compilemessages && daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application"]
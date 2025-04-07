#!/bin/env sh

python manage.py makemigrations chat games profiles notice
python manage.py migrate
python manage.py compilemessages

exec python manage.py runserver "$@"

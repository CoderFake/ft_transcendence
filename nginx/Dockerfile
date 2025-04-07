FROM nginx

RUN apt-get update && apt-get -y install openssl
RUN openssl req -x509 -newkey rsa:4096 -days 365 -nodes \
	-keyout /etc/ssl/private/pong.fr_key.pem \
	-out /etc/ssl/certs/pong.fr_cert.pem -sha256 \
	-subj "/C=FR/ST=Nouvelle Aquitaine/L=Angouleme/ \
	O=42 Angouleme/CN=pong.fr"

COPY nginx.conf /etc/nginx/nginx.conf

FROM nginx:1.12.2-alpine

COPY ./dist/ /usr/share/nginx/html

EXPOSE 80

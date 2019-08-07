FROM nginx:1.14.0-alpine

RUN apk update && \
    apk upgrade && \
    apk add nodejs && \
    npm rebuild bcrypt --build-from-source

WORKDIR /opt/manager
COPY . /opt/manager
run cp /opt/manager/default.conf /etc/nginx/conf.d/default.conf
RUN sed -i 's/localhost\:8021/localhost\:8081\/service/' /opt/manager/config/prod.env.js
RUN sed -i 's/https\:\/\/code.osehra.org/http\:\/\/localhost\:8081\/visual/' /opt/manager/config/prod.env.js
RUN npm install && npm run prod
run cp -r /opt/manager/dist/* /usr/share/nginx/html
EXPOSE 80

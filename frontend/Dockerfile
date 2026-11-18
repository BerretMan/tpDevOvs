FROM nginx:alpine
COPY --chmod=644 nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 public/ /usr/share/nginx/html/
EXPOSE 80

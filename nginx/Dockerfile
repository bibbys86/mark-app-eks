FROM nginx:alpine

# nginx 설정 파일 복사
COPY nginx-proxy.conf /etc/nginx/nginx.conf

# RUM 스크립트 파일들 복사
COPY rum-inject.js /etc/nginx/rum-inject.js
COPY datadog-rum-sdk.js /etc/nginx/datadog-rum-sdk.js

# 포트 80 노출
EXPOSE 80

# nginx 시작
CMD ["nginx", "-g", "daemon off;"] 
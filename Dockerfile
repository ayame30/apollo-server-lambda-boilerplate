FROM node:12.18.3-alpine3.9
RUN apk --no-cache add bash curl vim
SHELL ["/bin/bash", "-o", "pipefail", "-o", "errexit", "-u", "-c"]

WORKDIR /app
RUN npm install serverless -g
RUN npm install
EXPOSE 3000
CMD ["sls", "offline"]

# @Author Ismael alves
FROM node:carbon

LABEL maintainer="Ismael Alves cearaismael1997@gmail.com"
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Porta
EXPOSE 3000

# Volumes
VOLUME ["/app/logs"]
VOLUME ["/app/src/public"]

# Healthcheck
HEALTHCHECK --interval=60s --timeout=20s CMD curl --fail http://localhost:3000/system/healthcheck || exit 1

CMD [ "npm", "start" ]
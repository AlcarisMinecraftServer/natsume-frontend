FROM node:23-slim AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:1.25-alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'try_files $uri /index.html;\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

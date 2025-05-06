FROM node:23-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 4173
CMD ["yarn", "preview", "--host", "0.0.0.0"]

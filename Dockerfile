FROM node:22.18-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

ENV NODE_ENV=production
ENV PORT=3005
ENV NEXT_PUBLIC_COMMAC_BASE_URL=http://37.187.180.179:8080/api

EXPOSE 3005

CMD ["yarn", "start"]

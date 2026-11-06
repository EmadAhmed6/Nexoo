FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

COPY . .

EXPOSE 5000

CMD ["pnpm", "run", "dev"]
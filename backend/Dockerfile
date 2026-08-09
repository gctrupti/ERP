FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npm start"]

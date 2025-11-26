FROM node:20-alpine

# Instalar OpenSSL para compatibilidade com Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

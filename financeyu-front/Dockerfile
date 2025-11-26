FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock* package-lock.json* ./

# Instalar dependências
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copiar código fonte
COPY . .

# Build da aplicação
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# Expor porta padrão do Vite preview
EXPOSE 4173

# Iniciar em modo preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]

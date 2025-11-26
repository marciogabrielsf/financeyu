FROM node:20-alpine

WORKDIR /app

# Build argument para a URL da API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar arquivos de dependências
COPY package.json yarn.lock* package-lock.json* ./

# Instalar dependências
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copiar código fonte
COPY . .

# Build da aplicação (as variáveis VITE_* são injetadas aqui)
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# Expor porta padrão do Vite preview
EXPOSE 4173

# Iniciar em modo preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]

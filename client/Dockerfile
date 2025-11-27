FROM node:22-alpine
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts ./
RUN npm install
COPY src ./src
COPY index.html ./
ARG VITE_API_BASE_URL=http://localhost:9500/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build
EXPOSE 9501
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "9501"]

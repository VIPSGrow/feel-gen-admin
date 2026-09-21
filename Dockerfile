# Step 1: Base image (Node 20 LTS use kar rahe hain)
FROM node:20-alpine AS builder
WORKDIR /app

# Step 2: Dependencies install karein
COPY package*.json ./
RUN npm install

# Step 3: Source code copy karein aur build karein
COPY . .

# Environment variables (Build time par zaroori hain)
ARG NEXT_PUBLIC_API_URL=https://backend.feelsafeco.in
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Step 4: Production stage (Size kam rakhne ke liye)
FROM node:20-alpine
WORKDIR /app

# Builder stage se sirf zaroori files copy karein
COPY --from=builder /app ./

# Port 3000 expose karein (Agar aap port badalna chahte hain toh yahan change karein)
EXPOSE 3001

# Next.js app start karne ki command
CMD ["npm", "start"]
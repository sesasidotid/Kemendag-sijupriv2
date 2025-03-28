FROM node:latest AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

RUN npm install -g @angular/cli

COPY . .

RUN npm run build --configuration=production

FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/fe-template-angular/browser /usr/share/nginx/html

EXPOSE 80

# docker build -t sijupriv2
# docker run -d -p 8080:80 --name sijupriv2-container sijupriv2




# # Stage 1: Build Angular App
# FROM node:22-alpine AS build

# WORKDIR /app

# # Install Angular CLI globally
# RUN npm install -g @angular/cli

# # Copy package.json & package-lock.json first (to cache dependencies)
# COPY package*.json ./

# # Install dependencies
# RUN npm ci --legacy-peer-deps

# # Copy the rest of the app
# COPY . .

# RUN ng build && ls -la dist

# # Stage 2: Serve with Nginx
# FROM nginx:alpine

# # Copy Angular built files to Nginx
# # COPY --from=build /usr/src/app/dist/fe-template-angular /usr/share/nginx/html
# COPY --from=build /usr/local/app/dist/fe-template-angular/browser /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]
    

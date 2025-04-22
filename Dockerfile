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



    

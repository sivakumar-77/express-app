# express-app

## 🚀 Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js (v14 or higher)](https://nodejs.org/) 
- [TypeScript](https://www.typescriptlang.org/)

## 🛠 Environment Setup

If your PostgreSQL in Local then add DB Credential `.env` file in the root of the project with the following content:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres 
```
run `docker compose up` to run the PostgreSQL container

# Install Packages 

run `npm install` 

# Start the server 

run `npm start`

# Postman Collection 
1. User Login 
2. User register 
3. User Get Info using User Token

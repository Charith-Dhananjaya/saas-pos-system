# SaaS POS System

A modern, cloud-based Point of Sale (POS) system built with Spring Boot and React.

## Features
- **Modern UI**: Dark mode, glassmorphism, responsive design.
- **SaaS Analytics**: Real-time revenue trends, top products, and hourly sales charts.
- **Billing**: Stripe integration for card payments and refunds.
- **Observability**: Prometheus and Grafana monitoring.

## 🚀 How to Run

### Option 1: Run Everything with Docker (Recommended for Prod/Demo)
Starts Backend, Frontend, MySQL, Prometheus, and Grafana.
```bash
cd backend
docker-compose up -d --build
```
- **App**: http://localhost:5000
- **Grafana**: http://localhost:3001

### Option 2: Run Locally (Recommended for Development)

#### 1. Start Infrastructure (Database & Monitoring)
You need a running MySQL database. The easiest way is to use the provided docker-compose file to start *only* the dependencies:
```bash
cd backend
docker-compose up -d mysql prometheus grafana
```
*This exposes MySQL on `localhost:3306`.*

#### 2. Run Backend (Java)
- **Ideally**: Open `backend` folder in IntelliJ IDEA / Eclipse / VS Code and run `CdzPosSystemApplication.java`.
- **Or via Command Line**:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
The app will connect to the local MySQL running in Docker.

#### 3. Run Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
- **URL**: http://localhost:5173

## Configuration
The backend uses `backend/src/main/resources/application.yml`.
Default settings work out-of-the-box for local development.
To override secrets (JWT, Stripe), create a `.env` file in `backend/` or set environment variables in your IDE.

## API Documentation
Swagger UI: http://localhost:5000/swagger-ui.html

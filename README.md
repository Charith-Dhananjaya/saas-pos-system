# CDZ POS - Advanced SaaS Point of Sale System

A modern, cloud-native Point of Sale (POS) solution built for speed, scalability, and user experience. Designed for retail businesses, this system combines a robust Spring Boot backend with a sleek, responsive React frontend.

## 🌟 Key Features

### 🖥️ Frontend (React + Vite + Tailwind CSS)
- **Modern Dashboard**: Glassmorphism design with real-time analytics (Revenue, Orders, Top Products).
- **POS Terminal**: Fast checkout interface with cart management and product search.
- **Inventory Management**: Track stock levels, manage categories, and update product details.
- **User Management**: Role-based access control (Owner, Store Admin, Cashier).
- **Profile Settings**: 
    - Secure password updates.
    - **Profile Image Upload** (Local storage with preview).
    - Personal details management.
- **Themes**: Dark/Light mode support with a custom **Emerald Green** accent.
- **Responsive**: Fully optimized for desktop, tablet, and mobile devices.

### ⚙️ Backend (Spring Boot 3 + Java 17)
- **Secure API**: JWT-based authentication and stateless security.
- **Robust Architecture**: Layered architecture (Controller, Service, Repository) with DTO pattern.
- **Performance Optimized**: 
    - Pagination and sorting (e.g., Orders sorted by newest first).
    - Circular reference prevention in JSON serialization.
    - Efficient database queries with JPA/Hibernate.
- **File Handling**: Local file storage for profile images with `MultipartFile` support.
- **Observability**: Built-in Prometheus metrics and Grafana dashboard configuration.
- **SaaS Ready**: Structure supports multi-tenancy and Stripe integration for billing.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn UI, Recharts, Lucide Icons, Axios.
- **Backend**: Java 17, Spring Boot 3.2, Spring Security 6, Spring Data JPA, Hibernate.
- **Database**: MySQL 8.0.
- **DevOps**: Docker, Docker Compose, Prometheus, Grafana.

## 🚀 Getting Started

### Prerequisites
- **Java 17** Development Kit (JDK)
- **Node.js 18+** and npm
- **Docker** (Optional, for running MySQL/Prometheus/Grafana easily)
- **MySQL** (If not using Docker)

### 1. Database Setup
Start MySQL using Docker Compose (recommended):
```bash
cd backend
docker-compose up -d mysql
```
*Alternatively, create a local MySQL database named `pos_bs`.*

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  (Optional) Configure environment variables in `src/main/resources/application.yml` or create a `.env` file if properly configured.
    *   Default DB credentials: `root` / `1234`
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
    *The server will start on `http://localhost:5000`.*
    *Swagger UI: `http://localhost:5000/swagger-ui.html`*

### 3. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *Access the app at `http://localhost:3000` (or the port shown in terminal).*


## 📂 Project Structure

```
saas-pos-system/
├── backend/                 # Spring Boot Application
│   ├── src/main/java/       # Source code
│   ├── src/main/resources/  # Config (application.yml)
│   ├── uploads/             # Stores uploaded profile images
│   └── Dockerfile
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # UI Components (Shadcn, Custom)
│   │   ├── pages/           # Route Pages (Dashboard, POS, etc.)
│   │   ├── lib/             # Utilities (API, Utils)
│   │   └── contexts/        # React Contexts (Auth, Theme)
│   └── public/              # Static assets (Logo, Favicon)
└── README.md                # Project Documentation
```

## 🛡️ License
This project is licensed under the MIT License.

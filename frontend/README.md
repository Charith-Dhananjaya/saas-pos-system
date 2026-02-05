# SaaS POS System - Frontend

Modern, responsive frontend for the SaaS Point of Sale system built with React, Vite, Tailwind CSS, and shadcn/ui.

## Features

- 🎨 **Modern UI**: Beautiful, user-friendly interface with Tailwind CSS and shadcn/ui components
- 🔐 **Authentication**: Secure JWT-based authentication with login/signup
- 🛒 **POS Interface**: Intuitive point-of-sale interface for quick transactions
- 📦 **Product Management**: Full CRUD operations for products and categories
- 📊 **Order Management**: View and filter orders by payment type and status
- 👥 **Customer Management**: Add, edit, and search customers
- 👔 **Employee Management**: Manage store employees (Owner only)
- 📦 **Inventory Management**: Track product inventory levels
- 📈 **Shift Reports**: Start/end shifts and view shift reports
- 💰 **Refunds**: View refund history
- ⚙️ **Store Settings**: Manage store information (Owner only)
- 💳 **Payment Integration**: Support for Cash, UPI, and Card payments (Stripe)

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Stripe.js**: Payment processing for card payments
- **date-fns**: Date formatting utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   └── layout/       # Layout components
│   ├── contexts/         # React contexts (Auth)
│   ├── lib/             # Utilities and API client
│   ├── pages/           # Page components
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

All API calls are centralized in `src/lib/api.js`. The API client:
- Automatically adds JWT tokens to requests
- Handles authentication errors
- Provides typed API methods for all endpoints

## Features by Role

### Store Owner (ROLE_OWNER)
- Full access to all features
- Store settings management
- Employee management
- All reports and analytics

### Staff (ROLE_STAFF)
- POS interface
- Product viewing
- Order processing
- Customer management
- Inventory viewing
- Shift reports

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:5000)
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for card payments

## Notes

- The frontend is fully integrated with the backend API
- No hardcoded data - all data comes from the backend
- Responsive design works on desktop, tablet, and mobile
- Error handling and loading states throughout
- Toast notifications for user feedback

## License

Same as the main project.

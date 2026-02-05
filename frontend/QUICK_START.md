# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:5000`
- MySQL database configured and running

## Installation Steps

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
Create a `.env` file in the `frontend` directory with:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Access the application:**
Open your browser and go to `http://localhost:3000`

## First Time Setup

1. **Create an account:**
   - Go to `/signup`
   - Fill in your details
   - Select "Store Owner" role
   - Click "Sign Up"

2. **Create a store:**
   - After login, go to "Store Settings"
   - Fill in store information
   - Save

3. **Add products:**
   - Go to "Products"
   - Click "Add Product"
   - Fill in product details
   - Save

4. **Start using POS:**
   - Go to "POS" page
   - Select products
   - Add to cart
   - Process payment

## Common Issues

### Backend Connection Error
- Ensure backend is running on port 5000
- Check `VITE_API_BASE_URL` in `.env` file
- Verify CORS is enabled in backend

### Authentication Issues
- Clear browser localStorage
- Check if JWT token is valid
- Ensure backend authentication endpoints are working

### Products Not Loading
- Verify store is created
- Check store ID in API calls
- Ensure products are added to the store

## Development

- **Hot Reload**: Changes automatically reload
- **Build**: `npm run build` creates production build
- **Preview**: `npm run preview` previews production build

## Support

For issues or questions, check:
- Backend API documentation
- Browser console for errors
- Network tab for API calls

# E-commerce Website with Supabase Backend

A full-stack e-commerce clothing website built with React frontend and Supabase backend.

## 🚀 Features

- **User Authentication** - Sign up, login, logout with Supabase Auth
- **Product Catalog** - Browse products by category and brand
- **Shopping Cart** - Add/remove items, update quantities
- **Order Management** - Place orders with Cash on Delivery (COD)
- **User Profiles** - Manage shipping addresses
- **Product Reviews** - Rate and review purchased products
- **Admin Panel** - Manage products, orders, and customers
- **Search Functionality** - Search products by name/description
- **Responsive Design** - Mobile-friendly interface

## 🛠️ Tech Stack

### Frontend
- React 18
- Redux Toolkit (State Management)
- React Router (Navigation)
- Tailwind CSS (Styling)
- Radix UI (Components)
- Vite (Build Tool)

### Backend
- Supabase (Database & Auth)
- PostgreSQL (Database)
- Edge Functions (API)
- Row Level Security (RLS)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Supabase account

### 1. Clone the repository
```bash
git clone <repository-url>
cd ecommerce-supabase
```

### 2. Install dependencies
```bash
# Install client dependencies
cd client
npm install

# Install Supabase CLI (if not already installed)
npm install -g supabase
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env` file in the client directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Set up the database

1. Run the migration to create tables:
```bash
# In the root directory
supabase db reset
```

2. Or manually run the SQL from `supabase/migrations/create_ecommerce_schema.sql` in your Supabase SQL editor

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy auth
supabase functions deploy products
supabase functions deploy cart
supabase functions deploy orders
supabase functions deploy addresses
supabase functions deploy reviews
supabase functions deploy search
supabase functions deploy features
```

### 6. Start the development server

```bash
cd client
npm run dev
```

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles (extends auth.users)
- **categories** - Product categories
- **brands** - Product brands
- **products** - Product catalog
- **cart_items** - Shopping cart items
- **addresses** - User shipping addresses
- **orders** - Order records
- **order_items** - Individual items in orders
- **product_reviews** - Product reviews and ratings
- **feature_images** - Homepage banner images

### Security
- Row Level Security (RLS) enabled on all tables
- User-specific policies for data access
- Admin-only policies for sensitive operations

## 🔐 Authentication

The app uses Supabase Auth with the following features:
- Email/password authentication
- Session management
- Role-based access control (user/admin)
- Protected routes

### Admin Access
Only users with email `saqibijaz488@gmail.com` have admin access.

## 🛒 E-commerce Features

### For Customers
- Browse products by category/brand
- Search products
- Add items to cart
- Manage shipping addresses
- Place orders with COD
- View order history
- Write product reviews

### For Admins
- Manage product catalog
- View all orders
- Update order status
- View customer details
- Manage homepage banners

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Supabase)
1. Edge functions are automatically deployed
2. Database migrations run automatically
3. Configure environment variables in Supabase dashboard

## 📱 API Endpoints

All API endpoints are implemented as Supabase Edge Functions:

- `POST /functions/v1/auth` - Authentication
- `GET/POST/PUT/DELETE /functions/v1/products` - Product management
- `GET/POST/PUT/DELETE /functions/v1/cart` - Cart operations
- `GET/POST/PUT /functions/v1/orders` - Order management
- `GET/POST/PUT/DELETE /functions/v1/addresses` - Address management
- `GET/POST /functions/v1/reviews` - Product reviews
- `GET /functions/v1/search/{keyword}` - Product search
- `GET/POST /functions/v1/features` - Feature images

## 🔧 Configuration

### Environment Variables

**Client (.env)**
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Supabase Edge Functions**
- `SUPABASE_URL` - Automatically provided
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically provided

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
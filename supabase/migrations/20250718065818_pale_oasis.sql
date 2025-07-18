/*
  # E-commerce Database Schema Migration

  1. New Tables
    - `users` - User profiles (extends Supabase auth.users)
    - `categories` - Product categories
    - `brands` - Product brands  
    - `products` - Product catalog
    - `cart_items` - Shopping cart items
    - `addresses` - User shipping addresses
    - `orders` - Order records
    - `order_items` - Individual items in orders
    - `product_reviews` - Product reviews and ratings
    - `feature_images` - Homepage banner images

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for sensitive operations

  3. Functions
    - Update product average ratings
    - Calculate order totals
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image text,
  category_id uuid REFERENCES categories(id),
  brand_id uuid REFERENCES brands(id),
  price decimal(10,2) NOT NULL DEFAULT 0,
  sale_price decimal(10,2) DEFAULT 0,
  total_stock integer NOT NULL DEFAULT 0,
  average_review decimal(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  address text NOT NULL,
  city text NOT NULL,
  pincode text NOT NULL,
  phone text NOT NULL,
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'inProcess', 'inShipping', 'delivered', 'rejected')),
  payment_method text DEFAULT 'cod' CHECK (payment_method IN ('cod', 'paypal')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_id text,
  payer_id text,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  title text NOT NULL,
  image text,
  price decimal(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  review_message text,
  review_value integer NOT NULL CHECK (review_value >= 1 AND review_value <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Feature images table (for homepage banners)
CREATE TABLE IF NOT EXISTS feature_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image text NOT NULL,
  title text,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Men', 'men'),
  ('Women', 'women'),
  ('Kids', 'kids'),
  ('Accessories', 'accessories'),
  ('Footwear', 'footwear')
ON CONFLICT (slug) DO NOTHING;

-- Insert default brands
INSERT INTO brands (name, slug) VALUES
  ('Nike', 'nike'),
  ('Adidas', 'adidas'),
  ('Puma', 'puma'),
  ('Levi''s', 'levi'),
  ('Zara', 'zara'),
  ('H&M', 'h&m')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_images ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT TO anon, authenticated
  USING (true);

-- Brands policies (public read)
CREATE POLICY "Anyone can read brands" ON brands
  FOR SELECT TO anon, authenticated
  USING (true);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can read products" ON products
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Cart items policies
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Addresses policies
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Product reviews policies
CREATE POLICY "Anyone can read reviews" ON product_reviews
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reviews" ON product_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Feature images policies
CREATE POLICY "Anyone can read feature images" ON feature_images
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage feature images" ON feature_images
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION update_product_average_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET average_review = (
    SELECT COALESCE(AVG(review_value), 0)
    FROM product_reviews 
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_product_review_average
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_average_review();

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
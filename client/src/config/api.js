// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// API configuration for Supabase Edge Functions
const API_BASE_URL = `${SUPABASE_URL}/functions/v1`

export { API_BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY };
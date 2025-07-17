// API configuration for different environments
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.vercel.app' // Replace with your actual backend URL
  : 'http://localhost:5000';

export { API_BASE_URL };
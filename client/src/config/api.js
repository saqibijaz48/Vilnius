// API configuration for different environments
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://vilnius-production-82c5.up.railway.app' // Your Railway backend URL
  : 'http://localhost:5000';

export { API_BASE_URL };
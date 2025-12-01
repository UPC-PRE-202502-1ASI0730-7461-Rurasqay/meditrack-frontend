import axios from 'axios';

// Default to localhost if env var is missing (prevents relative path issues on Netlify)
const platformApi = import.meta.env.VITE_MEDITRACK_API_URL || 'http://localhost:5166/api/v1';

export class BaseApi {
    #http;
    constructor() {
        console.log('BaseApi initialized with URL:', platformApi);
        this.#http = axios.create({
            baseURL: platformApi,
            transformResponse: [function (data) {
                // Custom transform to prevent JSON.parse on HTML responses (404s from SPA)
                if (typeof data === 'string') {
                    const trimmed = data.trim();
                    if (trimmed.startsWith('<')) {
                        console.warn('API returned HTML, avoiding JSON parse');
                        return data; // Return raw string, don't parse
                    }
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        // If parse fails, return raw data
                        return data;
                    }
                }
                return data;
            }]
        });

        // Add request interceptor to include JWT token in headers
        this.#http.interceptors.request.use(
            (config) => {
                // Get token from localStorage or sessionStorage
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor to handle token errors
        this.#http.interceptors.response.use(
            (response) => {
                // Check if response is HTML when we expect JSON
                if (response.headers['content-type'] && 
                    response.headers['content-type'].includes('text/html') &&
                    response.config.responseType !== 'text' &&
                    response.config.responseType !== 'blob') {
                    console.error('Received HTML response from API. Check your API URL configuration.', response.config.url);
                }
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    // Optionally redirect to login
                    // window.location.href = '/auth/login';
                }
                return Promise.reject(error);
            }
        );
    }

    get http() {
        return this.#http;
    }
}
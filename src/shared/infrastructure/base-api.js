import axios from 'axios';

const platformApi = import.meta.env.VITE_MEDITRACK_API_URL;

export class BaseApi {
    #http;
    constructor() {
        this.#http = axios.create({
            baseURL: platformApi
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
            (response) => response,
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
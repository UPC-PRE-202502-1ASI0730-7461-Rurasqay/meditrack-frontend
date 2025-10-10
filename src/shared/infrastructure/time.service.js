const timeApiUrl = import.meta.env.VITE_TIME_API;

const endpoint = "timezone/America/Lima";

import axios from 'axios';

const http = axios.create({
    baseURL: timeApiUrl,
});

export class TimeApiService {
    getTime() {
        return http.get(`${endpoint}`);
    }
}
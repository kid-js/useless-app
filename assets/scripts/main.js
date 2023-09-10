import { app } from './app/app.js';

document.addEventListener(
    'DOMContentLoaded', 
    app.init.bind(app), 
    { once: true }
);
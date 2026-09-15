const express = require('express');
const serverless = require('serverless-http');

// Importa la configuración de tu app Express (rutas, middlewares, prisma, etc.)
const app = require('./app'); // Ajusta según la estructura de tu proyecto

// Exporta el handler para Netlify Functions
module.exports.handler = serverless(app);
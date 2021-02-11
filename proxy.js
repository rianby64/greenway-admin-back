'use strict';

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
 
const app = express();
 
app.use('/api', createProxyMiddleware({ target: 'http://green.leagrocol.com', changeOrigin: true }));
app.use(express.static('static'))
app.listen(3000);

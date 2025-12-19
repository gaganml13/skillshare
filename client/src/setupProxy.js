const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://skillshare-0yvk.onrender.com',
      changeOrigin: true,
    })
  );
};

const { createProxyMiddleware } = require('http-proxy-middleware');

console.log(process.env.JOB_SERVICE_URL)
const services = {
  job: {
    target: process.env.JOB_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // this fetched because express strips the path
      const originalUrl = req.originalUrl;
      if (path !== '/health') {
        return originalUrl.replace('/jobs', '');
      }
    },
    cookieDomainRewrite: '',
    onProxyReq: (proxyReq, req) => {
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.sub);
      }
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    },
  },
  monitoring: {
    target: process.env.MONITORING_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // this fetched because express strips the path
      const originalUrl = req.originalUrl;
      if (path !== '/health') {
        return originalUrl.replace('/monitor', '');
      }
    },
    cookieDomainRewrite: '',
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    },
  },
  // Add other services here
};

module.exports = (serviceName) => {
  if (!services[serviceName]) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return createProxyMiddleware(services[serviceName]);
};
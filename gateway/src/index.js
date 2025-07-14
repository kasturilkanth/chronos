const express = require('express');
const cors = require('cors');
const expressRateLimit = require('express-rate-limit');
const routes = require('./routes/v1.routes');


const app = express();
app.use(cors(
    {
        origin: '*', // Allow all origins
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific methods
        allowedHeaders: 'Content-Type, Authorization', // Allow specific headers
    }
));

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
const limiter = expressRateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.get('/health', (req, res) => {
    res.status(200).json({ service: "api-gateway", status: 'healthy' });
});
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gateway is running on port ${PORT}`);
});
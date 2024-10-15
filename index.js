const express = require('express');
const morgan = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimit } = require('express-rate-limit');
const axios = require('axios');

const {PORT} = require('./config/serverConfig')

const app = express();

const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
})

app.use(morgan("combined"));

app.use(limiter);

//calling AuthService isAuthenticated()
app.use('/api', async (req, res, next) => {
    //console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated',{
            headers: {
                'x-access-token' : req.headers['x-access-token']
            }
        })
        console.log(response.data);
        if(response.data.success){
            next();
        }
        else{
            res.status(401).json({
                message: 'Unauthorized'
            })
        }
    } catch (error) {
        res.status(401).json({
            message: 'Unauthorized user'
        })
    }
})

//getting bookingService
const exampleProxy = createProxyMiddleware({
    target: 'http://localhost:3002/api', // target host with the same base path
    changeOrigin: true, // needed for virtual hosted sites
});

// mount `exampleProxy` in web server
app.use('/api', exampleProxy);

app.get('/home', (req, res) => {
    return res.json({ message: 'OK' });
})

app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
})

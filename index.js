const express = require('express');
const morgan = require('morgan');
const app = express();
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const dotenv = require('dotenv').config(); 


const PORT = process.env.PORT;

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,
	max: 5, 
})

app.use(morgan('combined'));
app.use(limiter);

app.use('/bookingservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if(response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
});

app.use('/bookingservice',createProxyMiddleware({
    target: 'http://localhost:3002/bookingservice',
    changeOrigin: true,
    })
);


app.get('/home',(req,res)=>{
    res.json({message:'home page of api gateway'})
});

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})

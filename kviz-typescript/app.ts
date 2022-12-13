const path = require('path');
const express = require('express');
const USER = require('./controllers/socket-functions/auth');
const Errors = require('./db_models/errors');
const http = require("http");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const server = express();
server.use(cors())
const ioEvents = require('./controllers/socket-io');
const port = process.env.PORT;

server.set('views', './dist/views');
server.set('view engine', 'ejs');
server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));


process.on('uncaughtException', (error, origin) => {
    const err = new Errors({
        message: error,
        caused_by: origin
    })
    err.save();
})

process.on('unhandledRejection', (reason, promise) => {
    const err = new Errors({
        message: reason,
        caused_by: promise
    })
    err.save();
})

server.get('/activate/:token', USER.activateUser);

server.get('/errors', async (req: any, res: any, next: any) =>{
    const errors = await Errors.find()
    return res.render('errors',{
        data: errors
    })
});

server.use('', (req: any,res: any, next: any)=>{
        res.send({
            message: '404 Page not found'
        })
});

mongoose.connect(process.env.MONGO).then(() =>{
    const app = server.listen(port);
    const io = require('./socket').init(app);
    ioEvents.setupListeners();
    console.log('connected in dist')
}).catch((error: any)=>{
    console.error('error connecting')
    console.log(error)
})






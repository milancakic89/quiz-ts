"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
server.use(cors());
const ioEvents = require('./controllers/socket-io');
const port = process.env.PORT;
server.set('views', './dist/views');
server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use(express.static(path.join(__dirname, 'public')));
process.on('uncaughtException', (error, origin) => {
    const err = new Errors({
        message: error,
        caused_by: origin
    });
    err.save();
});
process.on('unhandledRejection', (reason, promise) => {
    const err = new Errors({
        message: reason,
        caused_by: promise
    });
    err.save();
});
server.get('/activate/:token', USER.activateUser);
server.get('/errors', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = yield Errors.find();
    return res.render('errors', {
        data: errors
    });
}));
server.use('', (req, res, next) => {
    res.send({
        message: '404 Page not found'
    });
});
mongoose.connect(process.env.MONGO).then(() => {
    const app = server.listen(port);
    const io = require('./socket').init(app);
    ioEvents.setupListeners();
    console.log('connected in dist');
}).catch((error) => {
    console.error('error connecting');
    console.log(error);
});

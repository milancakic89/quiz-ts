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
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMiddleware = exports.authMidleware = void 0;
const jwt = require('jsonwebtoken');
const ErrorDB = require('../db_models/errors');
const EVENTS = require('../controllers/socket-events');
const authMidleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.get('Authorization');
    if (authHeader) {
        const token = req.get('Authorization').split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SIGNING_SECRET);
        }
        catch (e) {
            return res.json({
                sucess: false,
                data: undefined,
                error: 'Authorization failed or missing tokken'
            });
        }
        if (!decodedToken) {
            return res.json({
                sucess: false,
                data: undefined,
                error: 'Authorization failed'
            });
        }
        req.user = decodedToken.user;
        if (req.user) {
            next();
        }
        else {
            return res.json({
                sucess: false,
                data: undefined,
                error: 'User not logged in'
            });
        }
    }
    else {
        return res.json({
            sucess: false,
            data: undefined,
            error: 'User not logged in'
        });
    }
});
exports.authMidleware = authMidleware;
const socketMiddleware = (socket, data, fn) => {
    const authHeader = data.Authorization;
    if (!authHeader) {
        socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED() });
        return null;
    }
    const token = authHeader;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.SIGNING_SECRET);
    }
    catch (e) {
        socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED() });
        return null;
    }
    if (!decodedToken) {
        socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED() });
        return null;
    }
    data.data = decodedToken.user;
    return fn(socket, data);
};
exports.socketMiddleware = socketMiddleware;

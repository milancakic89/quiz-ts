"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketCon = require('../../socket');
const EVENTS = require('./../socket-events');
let IO;
let connected = Math.floor(Math.random() * 30);
exports.setupCounter = () => {
    IO = socketCon.getIO();
};
const updateOnlineUsers = () => {
    IO.emit(EVENTS.ONLINE_USERS_COUNT(), { event: EVENTS.ONLINE_USERS_COUNT(), data: connected });
};
exports.increaseOnlineUsers = () => {
    connected++;
    updateOnlineUsers();
};
exports.decreaseOnlineUsers = () => {
    connected--;
    updateOnlineUsers();
};

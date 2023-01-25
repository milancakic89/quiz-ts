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
exports.setupListeners = void 0;
const socketCon = require('../socket');
const Users = require('../db_models/user');
const EVENTS = require('./socket-events');
const TOURNAMENT = require('./socket-functions/tournament');
const AUTH = require('./socket-functions/auth');
const friendListeners = require('./socket-events-setup/friends');
const questionListeners = require('./socket-events-setup/questions');
const roomListeners = require('./socket-events-setup/room');
const tournamentListeners = require('./socket-events-setup/tournament');
const userListeners = require('./socket-events-setup/user');
const COUNTER = require('./socket-functions/online-counter');
const DB = require('./DB-queue');
const saveDBSocket = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const IO = TOURNAMENT.getIO();
    const user = yield Users.findById(data.user_id);
    if (user) {
        user.socket = socket.id;
        user.online = true;
        socket.join(user._id.toString());
        yield user.save();
        return IO.emit(EVENTS.USER_CONNECTED(), { event: EVENTS.USER_CONNECTED(), socket_id: socket.id, user_id: data.user_id });
    }
    else {
        console.log('socket not saved');
    }
});
const disconectDBSocket = (io, socket) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Users.findOne({ socket: socket.id });
    if (user) {
        user.online = false;
        socket.leave(user._id.toString());
        yield user.save();
        return io.emit(EVENTS.USER_DISCONECTED(), { event: EVENTS.USER_DISCONECTED(), user_id: user._id });
    }
});
//EVENT FUNCTIONS
const disconectSocket = (io, socket) => {
    disconectDBSocket(io, socket);
};
const saveSocket = (socket, data) => {
    saveDBSocket(socket, data);
};
//SOCKETS EVENTS
const setupListeners = () => {
    const socketIo = socketCon.getIO();
    TOURNAMENT.setIOReady();
    friendListeners.setup();
    questionListeners.setup();
    roomListeners.setup();
    tournamentListeners.setup();
    userListeners.setup();
    COUNTER.setupCounter();
    DB.init();
    socketIo.on('connection', (socket) => {
        COUNTER.increaseOnlineUsers();
        socket.emit(EVENTS.AUTOLOGIN_AVAILABLE(), { event: EVENTS.AUTOLOGIN_AVAILABLE(), data: null });
        socket.on('disconnect', (data) => {
            COUNTER.increaseOnlineUsers();
            disconectSocket(socketIo, socket);
        });
        socket.on(EVENTS.DISCONNECT_USER(), (data) => {
            disconectSocket(socketIo, socket);
        });
        socket.on(EVENTS.SAVE_SOCKET(), (data) => {
            saveSocket(socket, data);
        });
        socket.on(EVENTS.LOGIN(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            AUTH.login(socket, data);
        }));
        socket.on(EVENTS.REGISTER(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            AUTH.signUp(socket, data);
        }));
        socket.on(EVENTS.RESET_PASSWORD(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            AUTH.resetPassword(socket, data);
        }));
        socket.on(EVENTS.RESET_PASSWORD_CONFIRMATION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            AUTH.resetPasswordConfirmation(socket, data);
        }));
    });
};
exports.setupListeners = setupListeners;

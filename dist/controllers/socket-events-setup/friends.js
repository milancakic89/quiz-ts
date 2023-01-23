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
exports.setup = void 0;
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const FRIEND_REQUESTS = require('../socket-functions/friend-requests');
const midleware = require('../../midleware/auth');
const setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', (socket) => {
        socket.on(EVENTS.GET_ALL_USERS(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.searchUsers);
        }));
        socket.on(EVENTS.GET_FRIEND_LIST(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendList);
        }));
        socket.on(EVENTS.GET_FRIEND_REQUESTS(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendRequests);
        }));
        socket.on(EVENTS.REMOVE_FRIEND(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.removeFriend);
        }));
        socket.on(EVENTS.ADD_FRIEND(), (data) => {
            FRIEND_REQUESTS.addDBFriend(socket, socketIo, data);
        });
        socket.on(EVENTS.ACCEPT_FRIEND(), (data) => {
            FRIEND_REQUESTS.acceptDBFriend(socket, data);
        });
        socket.on(EVENTS.INVITE_FRIENDS(), (data) => {
            FRIEND_REQUESTS.inviteFriends(socket, data);
        });
    });
};
exports.setup = setup;

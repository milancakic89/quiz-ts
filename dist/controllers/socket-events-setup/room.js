"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const TOURNAMENT = require('../socket-functions/tournament');
const QUESTIONS = require('../socket-functions/questions');
const ROOMS = require('../socket-functions/room');
const midleware = require('../../midleware/auth');
const setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', (socket) => {
        socket.on(EVENTS.LEAVE_ONE_ON_ONE(), (data) => {
            TOURNAMENT.leaveDBOneOnOne(socket, data);
        });
        socket.on(EVENTS.JOIN_ONE_ON_ONE(), (data) => {
            midleware.socketMiddleware(socket, data, ROOMS.joinOneOnOne);
        });
        socket.on(EVENTS.CREATE_ROOM(), (data) => {
            midleware.socketMiddleware(socket, data, ROOMS.createRoom);
        });
        socket.on(EVENTS.JOIN_ROOM(), (data) => {
            midleware.socketMiddleware(socket, data, ROOMS.joinDBRoom);
        });
        socket.on(EVENTS.LEAVE_ROOM(), (data) => {
            ROOMS.leaveDBRoom(socket, data);
        });
        socket.on(EVENTS.LEAVE_MATCH(), (data) => {
            socket.leave(data.roomName);
        });
        socket.on(EVENTS.GET_ROOM_RESULTS(), (data) => {
            ROOMS.getDBRoomResults(socket, data);
        });
        socket.on(EVENTS.CLEAN_THE_EMPTY_ROOMS(), (data) => {
            ROOMS.cleanRooms();
        });
        socket.on(EVENTS.GET_ROOM_QUESTION(), (data) => {
            QUESTIONS.getDBQuestion(socket, data);
        });
    });
};
exports.setup = setup;

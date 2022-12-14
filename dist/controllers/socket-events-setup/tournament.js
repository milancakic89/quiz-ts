"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const TOURNAMENT = require('../socket-functions/tournament');
const midleware = require('../../midleware/auth');
const setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', (socket) => {
        socket.on(EVENTS.OPONENT_ACCEPTED(), (data) => {
            socket.join(data.roomName);
            midleware.socketMiddleware(socket, data, TOURNAMENT.acceptDBOponent);
        });
        socket.on(EVENTS.OPONENT_DECLINED(), (data) => {
            midleware.socketMiddleware(socket, data, TOURNAMENT.declineOponent);
        });
        socket.on(EVENTS.START_TOURNAMENT(), (data) => {
            TOURNAMENT.startDBTournament(socket, data);
        });
        socket.on(EVENTS.SELECTED_QUESTION_LETTER(), (data) => {
            TOURNAMENT.checkDBTournamentQuestion(socket, data);
        });
    });
};
exports.setup = setup;

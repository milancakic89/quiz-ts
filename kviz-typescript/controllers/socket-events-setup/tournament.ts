import { Tournament } from "../../intrfaces/socket-functions-types";
import { EmittedData, EmittedLoggedInData, Socket, SocketIO } from "../../intrfaces/types";
import { Middleware } from "../../midleware/types";

export { }
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const TOURNAMENT: Tournament = require('../socket-functions/tournament');
const midleware: Middleware = require('../../midleware/auth');

export const setup = () => {
    const socketIo: SocketIO = socketCon.getIO();
    socketIo.on('connection', (socket: Socket) => {
        socket.on(EVENTS.OPONENT_ACCEPTED(), (data: EmittedData) => {
            socket.join(data.roomName)
            midleware.socketMiddleware(socket, data, TOURNAMENT.acceptDBOponent)
        });

        socket.on(EVENTS.OPONENT_DECLINED(), (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, TOURNAMENT.declineOponent)
        });


        socket.on(EVENTS.START_TOURNAMENT(), (data: EmittedLoggedInData) => {
            TOURNAMENT.startDBTournament(socket, data)
        })

        socket.on(EVENTS.SELECTED_QUESTION_LETTER(), (data: EmittedLoggedInData) => {
            TOURNAMENT.checkDBTournamentQuestion(socket, data)
        });


    })
}
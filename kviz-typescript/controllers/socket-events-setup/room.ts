import { Questions, Rooms, Tournament } from "../../intrfaces/socket-functions-types";
import { EmittedData, EmittedLoggedInData, Socket } from "../../intrfaces/types";
import { Middleware } from "../../midleware/types";

export { }
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const TOURNAMENT: Tournament = require('../socket-functions/tournament');
const QUESTIONS: Questions = require('../socket-functions/questions');
const ROOMS: Rooms = require('../socket-functions/room');
const midleware: Middleware = require('../../midleware/auth');

export const setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', (socket: Socket) => {

        socket.on(EVENTS.LEAVE_ONE_ON_ONE(), (data: EmittedLoggedInData) => {
            TOURNAMENT.leaveDBOneOnOne(socket, data)
        });

        socket.on(EVENTS.JOIN_ONE_ON_ONE(), (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, ROOMS.joinOneOnOne)
        });

        socket.on(EVENTS.CREATE_ROOM(), (data: EmittedLoggedInData) => {
            ROOMS.createRoom(socket, data);
        })

        socket.on(EVENTS.JOIN_ROOM(), (data: EmittedLoggedInData) => {
            midleware.socketMiddleware(socket, data, ROOMS.joinDBRoom);
        })

        socket.on(EVENTS.LEAVE_ROOM(), (data: EmittedLoggedInData) => {
            ROOMS.leaveDBRoom(socket, data)
        });

        socket.on(EVENTS.LEAVE_MATCH(), (data: EmittedData) => {
           socket.leave(data.roomName)
        });

        socket.on(EVENTS.GET_ROOM_RESULTS(), (data: EmittedLoggedInData) => {
            ROOMS.getDBRoomResults(socket, data)
        })

        socket.on(EVENTS.CLEAN_THE_EMPTY_ROOMS(), (data: EmittedData) => {
            ROOMS.cleanRooms()
        });

        socket.on(EVENTS.GET_ROOM_QUESTION(), (data: EmittedLoggedInData) => {
            QUESTIONS.getDBQuestion(socket, data)
        })
    })
}
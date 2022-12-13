import { Questions } from "../../intrfaces/socket-functions-types";
import { EmittedData, EmittedLoggedInData, Socket, SocketIO } from "../../intrfaces/types";
import { Middleware } from "../../midleware/types";

export { }
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const QUESTIONS: Questions = require('../socket-functions/questions');
const midleware: Middleware = require('../../midleware/auth');

export const setup = () => {
    const socketIo: SocketIO = socketCon.getIO();
    // QUESTIONS.resetQuestions();
    socketIo.on('connection', (socket: Socket) => {


        socket.on(EVENTS.ADD_QUESTION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.addQuestion)
        })

        socket.on(EVENTS.ADD_WORD_QUESTION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.addWordQuestion)
        });

        socket.on(EVENTS.LOAD_SINGLE_QUESTION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.loadQuestion)
        })

        socket.on(EVENTS.GET_QUESTION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.getQuestion)
        })

        socket.on(EVENTS.GET_QUESTIONS(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.getAllQuestions)
        });

        socket.on(EVENTS.CHECK_QUESTION(), async (data: EmittedLoggedInData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.checkQuestion)
        })

        socket.on(EVENTS.DELETE_QUESTION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.deleteQuestion)
        });

        socket.on(EVENTS.PUBLISH_QUESTION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.publishQuestion)
        });

        socket.on(EVENTS.UNPUBLISH_QUESTION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.unpublishQuestion)
        });

        socket.on(EVENTS.CHECK_PRACTICE_QUESTION(), async (data: EmittedData) => {
           midleware.socketMiddleware(socket, data, QUESTIONS.checkQuestion)
        })

    })
}
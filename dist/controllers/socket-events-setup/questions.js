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
const QUESTIONS = require('../socket-functions/questions');
const midleware = require('../../midleware/auth');
const setup = () => {
    const socketIo = socketCon.getIO();
    // QUESTIONS.resetQuestions();
    socketIo.on('connection', (socket) => {
        socket.on(EVENTS.ADD_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.addQuestion);
        }));
        socket.on(EVENTS.ADD_WORD_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.addWordQuestion);
        }));
        socket.on(EVENTS.LOAD_SINGLE_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.loadQuestion);
        }));
        socket.on(EVENTS.GET_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.getQuestion);
        }));
        socket.on(EVENTS.GET_QUESTIONS(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.getAllQuestions);
        }));
        socket.on(EVENTS.CHECK_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.checkQuestion);
        }));
        socket.on(EVENTS.DELETE_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.deleteQuestion);
        }));
        socket.on(EVENTS.PUBLISH_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.publishQuestion);
        }));
        socket.on(EVENTS.UNPUBLISH_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.unpublishQuestion);
        }));
        socket.on(EVENTS.CHECK_PRACTICE_QUESTION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.checkQuestion);
        }));
    });
};
exports.setup = setup;

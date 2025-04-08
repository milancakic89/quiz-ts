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
const AUTH = require('../socket-functions/auth');
const USERS = require('../socket-functions/user');
const ACHIEVEMENTS = require('../socket-functions/achievements');
const midleware = require('../../midleware/auth');
const setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', (socket) => {
        socket.on(EVENTS.GET_RANKING_LIST(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.getRankingList);
        }));
        socket.on(EVENTS.GET_DAILY_REWARD(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.resetDailyPrice);
        }));
        socket.on(EVENTS.RESET_PLAYING_STATE(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.resetPlayingState);
        }));
        socket.on(EVENTS.RESET_LIVES(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.resetLives);
        }));
        socket.on(EVENTS.UPDATE_SCORE(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.updateScore);
        }));
        socket.on(EVENTS.UPDATE_SETTINGS(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.updateSettings);
        }));
        socket.on(EVENTS.REMOVE_NOTIFICATION(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.removeNotification);
        }));
        socket.on(EVENTS.REDUCE_LIVES(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, QUESTIONS.reduceLives);
        }));
        socket.on(EVENTS.ACCOUNT_ACTIVATED(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            AUTH.activateEmail(socket, data);
        }));
        socket.on(EVENTS.GET_ACHIEVEMENTS(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, ACHIEVEMENTS.getAchievements);
        }));
        socket.on(EVENTS.REFRESH_USER(), (data) => {
            midleware.socketMiddleware(socket, data, AUTH.refresh);
        });
        socket.on(EVENTS.AUTOLOGIN(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, AUTH.autoLogin);
        }));
        socket.on(EVENTS.BUY_ITEM(), (data) => __awaiter(void 0, void 0, void 0, function* () {
            midleware.socketMiddleware(socket, data, USERS.buyItem);
        }));
    });
};
exports.setup = setup;

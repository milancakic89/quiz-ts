import { Achievements, Auth, Questions, UserFn } from "../../intrfaces/socket-functions-types";
import { EmittedData, Socket } from "../../intrfaces/types";
import { Middleware } from "../../midleware/types";

export { }
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const QUESTIONS: Questions = require('../socket-functions/questions');
const AUTH: Auth = require('../socket-functions/auth');
const USERS: UserFn = require('../socket-functions/user');
const ACHIEVEMENTS: Achievements = require('../socket-functions/achievements');
const midleware: Middleware = require('../../midleware/auth');

export const setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', (socket: Socket) => {

        socket.on(EVENTS.GET_RANKING_LIST(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.getRankingList)
        })

        socket.on(EVENTS.GET_DAILY_REWARD(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.resetDailyPrice)
        })

        socket.on(EVENTS.RESET_PLAYING_STATE(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.resetPlayingState)
        })

        socket.on(EVENTS.RESET_LIVES(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.resetLives)
        })
        socket.on(EVENTS.UPDATE_SCORE(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.updateScore)
        })

        socket.on(EVENTS.UPDATE_SETTINGS(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.updateSettings)
        })

        socket.on(EVENTS.REMOVE_NOTIFICATION(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.removeNotification)
        });

        socket.on(EVENTS.REDUCE_LIVES(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, QUESTIONS.reduceLives)
        })

        socket.on(EVENTS.GET_ACHIEVEMENTS(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, ACHIEVEMENTS.getAchievements)
        });

        socket.on(EVENTS.REFRESH_USER(), (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, AUTH.refresh)
        })

        socket.on(EVENTS.AUTOLOGIN(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, AUTH.autoLogin);
        });

        socket.on(EVENTS.BUY_ITEM(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, USERS.buyItem);
        });
        

    })
}
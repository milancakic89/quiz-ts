import { FriendRequests } from "../../intrfaces/socket-functions-types";
import { EmittedData, EmittedLoggedInData, Socket } from "../../intrfaces/types";
import { Middleware } from "../../midleware/types";

export {}
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const FRIEND_REQUESTS: FriendRequests = require('../socket-functions/friend-requests');
const midleware: Middleware = require('../../midleware/auth');

export const setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', (socket: Socket) => {

        socket.on(EVENTS.GET_ALL_USERS(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.searchUsers);
        });
        socket.on(EVENTS.GET_FRIEND_LIST(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendList)
        });

        socket.on(EVENTS.GET_FRIEND_REQUESTS(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendRequests)
        })

        socket.on(EVENTS.REMOVE_FRIEND(), async (data: EmittedData) => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.removeFriend)
        })

        socket.on(EVENTS.ADD_FRIEND(), (data: EmittedLoggedInData) => {
            FRIEND_REQUESTS.addDBFriend(socket, data)
        })

        socket.on(EVENTS.ACCEPT_FRIEND(), (data: EmittedLoggedInData) => {
            FRIEND_REQUESTS.acceptDBFriend(socket, data)
        });

        socket.on(EVENTS.INVITE_FRIENDS(), (data: EmittedLoggedInData) => {
            FRIEND_REQUESTS.inviteFriends(socket, data);
        });
      
    })
}
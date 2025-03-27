import { EmittedData, EmittedLoggedInData, Socket, SocketIO } from "../intrfaces/types";

export { }
const socketCon = require('../socket');
const Users = require('../db_models/user');
const EVENTS = require('./socket-events');
const TOURNAMENT = require('./socket-functions/tournament');
const AUTH = require('./socket-functions/auth');
const friendListeners = require('./socket-events-setup/friends');
const questionListeners = require('./socket-events-setup/questions');
const roomListeners = require('./socket-events-setup/room');
const tournamentListeners = require('./socket-events-setup/tournament');
const userListeners = require('./socket-events-setup/user');
const COUNTER = require('./socket-functions/online-counter');
const DB = require('./DB-queue');

const saveDBSocket = async (socket: Socket, data: EmittedLoggedInData) =>{
    const IO = TOURNAMENT.getIO();
    const user = await Users.findById(data.user_id);
    if(user){
        user.socket = socket.id;
        user.online = true;
        socket.join(user._id.toString());
        await user.save();
        console.log('USER CONNECTED')
        return IO.emit(EVENTS.USER_CONNECTED(), { event: EVENTS.USER_CONNECTED(), socket_id: socket.id, user_id: data.user_id })
    }else{
        console.log('socket not saved')
    }
}

const disconectDBSocket = async (io: SocketIO, socket: Socket) =>{
    const user = await Users.findOne({socket: socket.id});
    if (user) {
        user.online = false;
        socket.leave(user._id.toString());
        await user.save();
        return io.emit(EVENTS.USER_DISCONECTED(), { event: EVENTS.USER_DISCONECTED(), user_id: user._id })
    }
   
}

//EVENT FUNCTIONS

const disconectSocket = (io: SocketIO, socket: Socket ) => {
    disconectDBSocket(io, socket)
}

const saveSocket = (socket: Socket, data: EmittedLoggedInData) => {
    saveDBSocket(socket, data)
}


//SOCKETS EVENTS

export const setupListeners = () =>{
    const socketIo = socketCon.getIO();
    TOURNAMENT.setIOReady();
    friendListeners.setup();
    questionListeners.setup();
    roomListeners.setup();
    tournamentListeners.setup();
    userListeners.setup();
    COUNTER.setupCounter();
    DB.init();

    console.log('setup listeners')



    socketIo.on('connection', (socket: Socket) =>{

        COUNTER.increaseOnlineUsers();
        socket.emit(EVENTS.AUTOLOGIN_AVAILABLE(), { event: EVENTS.AUTOLOGIN_AVAILABLE(), data: null });


        socket.on('disconnect', (data: EmittedData) => {
            COUNTER.increaseOnlineUsers()
            disconectSocket(socketIo, socket);
        })

        socket.on(EVENTS.DISCONNECT_USER(), (data: EmittedData) => {  
            disconectSocket(socketIo, socket);
        });

        socket.on(EVENTS.SAVE_SOCKET(), (data: EmittedLoggedInData) => {
            saveSocket(socket, data);
        });

        socket.on(EVENTS.LOGIN(), async (data: EmittedData) => {
            AUTH.login(socket, data);
        });

        socket.on(EVENTS.REGISTER(), async (data: EmittedData) => {
            AUTH.signUp(socket, data)
        })

        socket.on(EVENTS.RESET_PASSWORD(), async (data: EmittedData) => {
            AUTH.resetPassword(socket, data)
        })

        socket.on(EVENTS.RESET_PASSWORD_CONFIRMATION(), async (data: EmittedData) => {
            AUTH.resetPasswordConfirmation(socket, data)
        })
    });
}
import { EmittedLoggedInData, Socket, UserType } from "../../intrfaces/types";

export { }
const Room = require('../../db_models/rooms');
const Users = require('../../db_models/user');
const TOURNAMENT = require('./tournament');
const crypto = require('crypto');
const EVENTS = require('../socket-events');



export const randomValue = (len: number) => {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
}

export const createRoom = (socket: Socket, userData: EmittedLoggedInData) => {
    const room = randomValue(5);
    if (room) {
        return createDBRoom(socket, room, userData)
    }
}
export const cleanRooms = async () => {
    const result = { success: true }
    const rooms = await Room.find();
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].total_questions === 15 && !rooms[i].allow_enter) {
            await Room.findByIdAndDelete(rooms[i]._id)
        }
    }
    return result;
}

export const createMatchRoom = async (room: string, users: any[]) => {
    const response = { success: false }
    const question  = await TOURNAMENT.generateNewRandomQuestion();
    const newRoom = new Room({
        room_id: room,
        users: users,
        allow_enter: true,
        current_question: question,
        question_counter: 15,
        total_questions: 15

    })
    const result = await newRoom.save();

    if (result) {
        response.success = true;
    }
    return response;
}

export const createDBRoom = async (socket: Socket, room: string, userData: EmittedLoggedInData) => {
    
    try{
        const response = { success: false }
        const _user = userData.data || userData;
        const user = await Users.findOne({ _id: _user._id });
        const startsAt = userData.startsAt || 0;
        const newRoom = new Room({
            room_id: room,
            users: [],
            allow_enter: true,
            total_questions: 0,
            startsAt: startsAt,
            created_by: userData.data._id
        })
        const result = await newRoom.save();
        if (result) {
            user.room = room;
            user.socket = socket.id;
            await user.save();
            result.success = true;
            socket.emit(EVENTS.ROOM_CREATED(), { success: true, created_by: newRoom.created_by, event: `${EVENTS.ROOM_CREATED()}`, roomName: room })
        }
        return response;
    }catch(e){
        console.log(e)
    }

}

export const joinDBRoom = async (socket: Socket, userAndRoom: EmittedLoggedInData) => {
    try{

    if (userAndRoom.roomName === '1on1') {
        return joinOneOnOne(socket, userAndRoom)
    }
    const io = TOURNAMENT.getIO()
    const response = { success: false }
    const room = await Room.findOne({ room_id: userAndRoom.roomName });
    const user: UserType = await Users.findOne({ _id: userAndRoom.user_id });
    const socketRooms = socket.rooms;
    if (socketRooms){
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`)
        });
        socket.join(`${userAndRoom.user_id}`)
    }
    if (room && room.allow_enter) {
        const haveUser = room.users.some((user: any) => user.id === null || user.id === userAndRoom.user_id);
        user.room = userAndRoom.roomName;
        user.socket = socket.id;
        await user.save();
        if (!haveUser) {
            room.users.push({
                _id: userAndRoom.user_id,
                score: 0,
                answered: false,
                name: user.name,
                avatar_url: user.avatar_url,
            });
        }
        const result = await room.save();
        if (result) {
            result.success = true;
            socket.join(`${userAndRoom.roomName}`);
            io.in(`${userAndRoom.roomName}`).emit(EVENTS.JOINED_ROOM(), { users: room.users, created_by: room.created_by, event: EVENTS.JOINED_ROOM(), socked: socket.id, roomName: userAndRoom.roomName })
        }
    } else {
        socket.emit(EVENTS.ROOM_DONT_EXIST(), {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: 'joinDBRoom'
        });
    }
    return response;
    }catch(e){
        console.log(e)
    }

}


export const leaveDBRoom = async (socket: Socket, userAndRoom: EmittedLoggedInData) => {
    const io = TOURNAMENT.getIO()
    const room = await Room.findOne({ room_id: userAndRoom.roomName });
    const socketRooms = socket.rooms;
    if(socketRooms){
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`)
        });
        socket.join(`${userAndRoom.user_id}`)
    }
    if (room) {
        const room_id = room._id;
        room.users = room.users.filter((user: any) => user.id !== userAndRoom.user_id);
        await room.save();
        if (!room.users.length) {
            await Room.findByIdAndDelete(room_id);
        }
        io.in(`${userAndRoom.roomName}`).emit(EVENTS.LEAVED_ROOM(),
            { users: room.users, event: EVENTS.LEAVED_ROOM() })
    }
}

export const getDBRoomResults = async (socket: Socket, data: EmittedLoggedInData) => {
    const room = await Room.findOne({ room_id: data.roomName });
    if (!room) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'getDBRoomResults'
        });
    }
    socket.emit(EVENTS.GET_ROOM_RESULTS(), { event: EVENTS.GET_ROOM_RESULTS(), users: room.users })
}

export const joinOneOnOneDBRoom = async (socket: Socket, data: EmittedLoggedInData) => {
    const socketRooms = socket.rooms;
    if (socketRooms) {
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`)
        });
        socket.join(`${data.user_id}`)
    }

}


export const joinOneOnOne = async (socket: Socket, userAndRoom: EmittedLoggedInData) => {
    const QUEUE = TOURNAMENT.getQueue();
    const user = { 
        _id: userAndRoom.user_id || userAndRoom._id,
        name: userAndRoom.name,
        socket: socket.id,
        mainScore: userAndRoom.score,
        score: 0, 
        blocked: [], 
        gameAccepted: false,
        playing: false,
        avatar_url: userAndRoom.avatar_url
     };

    QUEUE.addToQueue(user, socket);


}
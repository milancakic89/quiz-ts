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
exports.joinOneOnOne = exports.joinOneOnOneDBRoom = exports.getDBRoomResults = exports.leaveDBRoom = exports.joinDBRoom = exports.createDBRoom = exports.createMatchRoom = exports.cleanRooms = exports.createRoom = exports.randomValue = void 0;
const Room = require('../../db_models/rooms');
const Users = require('../../db_models/user');
const TOURNAMENT = require('./tournament');
const crypto = require('crypto');
const EVENTS = require('../socket-events');
const randomValue = (len) => {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
};
exports.randomValue = randomValue;
const createRoom = (socket, userData) => {
    const room = (0, exports.randomValue)(5);
    if (room) {
        return (0, exports.createDBRoom)(socket, room, userData);
    }
};
exports.createRoom = createRoom;
const cleanRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = { success: true };
    const rooms = yield Room.find();
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].total_questions === 15 && !rooms[i].allow_enter) {
            yield Room.findByIdAndDelete(rooms[i]._id);
        }
    }
    return result;
});
exports.cleanRooms = cleanRooms;
const createMatchRoom = (room, users) => __awaiter(void 0, void 0, void 0, function* () {
    const response = { success: false };
    const newRoom = new Room({
        room_id: room,
        users: users,
        allow_enter: true,
        total_questions: 0
    });
    const result = yield newRoom.save();
    if (result) {
        response.success = true;
    }
    return response;
});
exports.createMatchRoom = createMatchRoom;
const createDBRoom = (socket, room, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const response = { success: false };
    const user = yield Users.findOne({ _id: userData.user_id });
    const startsAt = userData.startsAt || 0;
    const newRoom = new Room({
        room_id: room,
        users: [],
        allow_enter: true,
        total_questions: 0,
        startsAt: startsAt,
        created_by: userData.user_id
    });
    const result = yield newRoom.save();
    if (result) {
        user.room = room;
        user.socket = socket.id;
        yield user.save();
        result.success = true;
        socket.emit(EVENTS.ROOM_CREATED(), { success: true, created_by: newRoom.created_by, event: `${EVENTS.ROOM_CREATED()}`, roomName: room });
    }
    return response;
});
exports.createDBRoom = createDBRoom;
const joinDBRoom = (socket, userAndRoom) => __awaiter(void 0, void 0, void 0, function* () {
    if (userAndRoom.roomName === '1on1') {
        return (0, exports.joinOneOnOne)(socket, userAndRoom);
    }
    const io = TOURNAMENT.getIO();
    const response = { success: false };
    const room = yield Room.findOne({ room_id: userAndRoom.roomName });
    const user = yield Users.findOne({ _id: userAndRoom.user_id });
    const socketRooms = socket.rooms;
    if (socketRooms) {
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`);
        });
        socket.join(`${userAndRoom.user_id}`);
    }
    if (room && room.allow_enter) {
        const haveUser = room.users.some((user) => user.id === null || user.id === userAndRoom.user_id);
        user.room = userAndRoom.roomName;
        user.socket = socket.id;
        yield user.save();
        if (!haveUser) {
            room.users.push({
                name: userAndRoom.name,
                id: userAndRoom.user_id,
                score: 0,
                answered: false,
                avatar: userAndRoom.avatar,
            });
        }
        const result = yield room.save();
        if (result) {
            result.success = true;
            socket.join(`${userAndRoom.roomName}`);
            io.in(`${userAndRoom.roomName}`).emit(EVENTS.JOINED_ROOM(), { users: room.users, created_by: room.created_by, event: EVENTS.JOINED_ROOM(), socked: socket.id });
        }
    }
    else {
        socket.emit(EVENTS.ROOM_DONT_EXIST(), {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: 'joinDBRoom'
        });
    }
    return response;
});
exports.joinDBRoom = joinDBRoom;
const leaveDBRoom = (socket, userAndRoom) => __awaiter(void 0, void 0, void 0, function* () {
    const io = TOURNAMENT.getIO();
    const room = yield Room.findOne({ room_id: userAndRoom.roomName });
    const socketRooms = socket.rooms;
    if (socketRooms) {
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`);
        });
        socket.join(`${userAndRoom.user_id}`);
    }
    if (room) {
        const room_id = room._id;
        room.users = room.users.filter((user) => user.id !== userAndRoom.user_id);
        yield room.save();
        if (!room.users.length) {
            yield Room.findByIdAndDelete(room_id);
        }
        io.in(`${userAndRoom.roomName}`).emit(EVENTS.LEAVED_ROOM(), { users: room.users, event: EVENTS.LEAVED_ROOM() });
    }
});
exports.leaveDBRoom = leaveDBRoom;
const getDBRoomResults = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield Room.findOne({ room_id: data.roomName });
    if (!room) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'getDBRoomResults'
        });
    }
    socket.emit(EVENTS.GET_ROOM_RESULTS(), { event: EVENTS.GET_ROOM_RESULTS(), users: room.users });
});
exports.getDBRoomResults = getDBRoomResults;
const joinOneOnOneDBRoom = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const socketRooms = socket.rooms;
    if (socketRooms) {
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`);
        });
        socket.join(`${data.user_id}`);
    }
});
exports.joinOneOnOneDBRoom = joinOneOnOneDBRoom;
const joinOneOnOne = (socket, userAndRoom) => __awaiter(void 0, void 0, void 0, function* () {
    const QUEUE = TOURNAMENT.getQueue();
    const user = {
        _id: userAndRoom.user_id,
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
});
exports.joinOneOnOne = joinOneOnOne;

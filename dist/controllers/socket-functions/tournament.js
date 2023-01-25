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
exports.leaveDBOneOnOne = exports.acceptDBOponent = exports.declineOponent = exports.checkDBTournamentQuestion = exports.checkMatchQuestion = exports.startDBTournamentQuestion = exports.startDBTournament = exports.generateNewRandomQuestion = exports.getIO = exports.getQueue = exports.setIOReady = void 0;
const Room = require('../../db_models/rooms');
const ROOMS = require('../socket-functions/room');
const QUESTIONS = require('./questions'); //socket event functions
const Questions = require('../../db_models/question'); //mongoDB model
const EVENTS = require('../socket-events');
const Users = require('../../db_models/user');
const socketCon = require('../../socket');
const QUE = require('../one-on-one-queue');
const DBQUEUE = require('../DB-queue').getDBQueue();
var IO;
var QUEUE = {
    acceptOpponent: (oponentID, myID, roomName) => { },
    declineOpponent: (oponentID, myID, roomName) => { },
    addToQueue: (user) => { }
};
const getRandomNumber = (quantity) => {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(Math.random() * Math.floor(milliseconds * quantity / 1000));
};
const setIOReady = () => {
    IO = socketCon.getIO();
    QUEUE = QUE.QueueManager.getInstance();
};
exports.setIOReady = setIOReady;
const getQueue = () => {
    return QUEUE;
};
exports.getQueue = getQueue;
const getIO = () => {
    return IO;
};
exports.getIO = getIO;
const generateNewRandomQuestion = () => __awaiter(void 0, void 0, void 0, function* () {
    const questions = yield Questions.find({ status: 'ODOBRENO' });
    const question = JSON.parse(JSON.stringify(questions[getRandomNumber(questions.length)]));
    return question;
});
exports.generateNewRandomQuestion = generateNewRandomQuestion;
const startDBTournament = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    let tournamentRoom = yield Room.findOne({ room_id: data.roomName });
    const amountOfQuestions = data.amountOfQuestions || 15;
    if (!tournamentRoom) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'startDBTournament'
        });
    }
    const io = (0, exports.getIO)();
    const question = yield (0, exports.generateNewRandomQuestion)();
    tournamentRoom.current_question = question;
    tournamentRoom.question_counter = amountOfQuestions;
    tournamentRoom.total_questions = amountOfQuestions;
    yield tournamentRoom.save();
    io.to(`${data.roomName}`).emit(EVENTS.TOURNAMENT_STARTING(), { event: EVENTS.TOURNAMENT_STARTING() });
});
exports.startDBTournament = startDBTournament;
const startDBTournamentQuestion = (io, data) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield Room.findOne({ room_id: data.roomName });
    if (!room) {
        return io.in(`${data.roomName}`).emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'startDBTournamentQuestion'
        });
    }
    if (room.question_counter < 1) {
        room.allow_enter = false;
        yield room.save();
        io.in(`${data.roomName}`).emit(EVENTS.TOURNAMENT_FINISHED(), { event: EVENTS.TOURNAMENT_FINISHED(), users: room.users });
        if (data && data.match) {
            const user1 = yield Users.findById(room.users[0]._id);
            const user2 = yield Users.findById(room.users[1]._id);
            user1.score = user1.score + room.users[0].score;
            user2.score = user2.score + room.users[1].score;
            yield user1.save();
            yield user2.save();
        }
        return;
    }
    else {
        let counter = room.question_counter - 1;
        room.question_counter = counter;
        const question = yield (0, exports.generateNewRandomQuestion)();
        room.current_question = question;
        yield room.save();
        io.in(`${data.roomName}`).emit(EVENTS.EVERYONE_ANSWERED(), { event: EVENTS.EVERYONE_ANSWERED(), users: room.users });
    }
});
exports.startDBTournamentQuestion = startDBTournamentQuestion;
const checkMatchQuestion = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield Room.findOne({ room_id: data.roomName });
    if (!room) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'checkDBTournamentQuestion'
        });
    }
    const question = room.current_question;
    const users = JSON.parse(JSON.stringify(room.users));
    users.forEach(user => {
        if (user._id === data.user_id) {
            user.answered = true;
            if (data.letter === question.correct_letter) {
                user.score++;
            }
        }
    });
    const io = (0, exports.getIO)();
    room.users = users;
    const everyone_answered = users.every((user) => user.answered === true);
    if (everyone_answered) {
        const resetUsers = JSON.parse(JSON.stringify(room.users));
        resetUsers.forEach((user) => {
            user.answered = false;
        });
        room.users = resetUsers;
        room.total_questions = room.total_questions + 1;
        yield room.save();
        io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: resetUsers });
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: resetUsers });
        data.match = true;
        (0, exports.startDBTournamentQuestion)(io, data);
    }
    else {
        yield room.save();
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users });
        io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: users });
    }
});
exports.checkMatchQuestion = checkMatchQuestion;
const checkDBTournamentQuestion = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.match) {
        return (0, exports.checkMatchQuestion)(socket, data);
    }
    const room = yield Room.findOne({ room_id: data.roomName });
    if (!room) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'checkDBTournamentQuestion'
        });
    }
    const question = room.current_question;
    const users = JSON.parse(JSON.stringify(room.users));
    users.forEach((user) => {
        if (user.id === data.user_id) {
            user.answered = true;
            if (data.letter === question.correct_letter) {
                user.score++;
            }
        }
    });
    const io = (0, exports.getIO)();
    room.users = users;
    const everyone_answered = room.users.every((user) => user.answered === true);
    if (everyone_answered) {
        const resetUsers = JSON.parse(JSON.stringify(room.users));
        resetUsers.forEach((user) => {
            user.answered = false;
        });
        room.users = resetUsers;
        room.total_questions = room.total_questions + 1;
        yield room.save();
        io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: room.users });
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users });
        (0, exports.startDBTournamentQuestion)(io, data);
    }
    else {
        yield room.save();
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users });
        io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: room.users });
    }
});
exports.checkDBTournamentQuestion = checkDBTournamentQuestion;
const declineOponent = (socket, data) => {
    QUEUE.declineOpponent(data.oponentID, data.data._id, data.roomName);
};
exports.declineOponent = declineOponent;
const acceptDBOponent = (socket, data) => {
    QUEUE.acceptOpponent(data.oponentID, data.data._id, data.roomName);
};
exports.acceptDBOponent = acceptDBOponent;
const leaveDBOneOnOne = (socket, data) => {
    socket.emit(EVENTS.LEAVE_ONE_ON_ONE(), { event: EVENTS.LEAVE_ONE_ON_ONE(), success: true });
};
exports.leaveDBOneOnOne = leaveDBOneOnOne;

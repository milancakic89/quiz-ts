import { textSpanContainsPosition } from "typescript";
import { EmittedLoggedInData, Question, Socket, SocketIO } from "../../intrfaces/types";

export { }
const Room = require('../../db_models/rooms');
const ROOMS = require('../socket-functions/room');
const QUESTIONS = require('./questions'); //socket event functions
const Questions = require('../../db_models/question'); //mongoDB model
const EVENTS = require('../socket-events');
const Users = require('../../db_models/user');
const socketCon = require('../../socket');
const QUE = require('../one-on-one-queue');
const DBQUEUE = require('../DB-queue').getDBQueue();

var IO: SocketIO;
var QUEUE = {
    acceptOpponent: (oponentID: string, myID: string, roomName: string) => {},
    declineOpponent: (oponentID: string, myID: string, roomName: string) => {},
    addToQueue: (user: any) => { } 
};


const getRandomNumber = (quantity: number) => {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(Math.random() * Math.floor(milliseconds * quantity / 1000))
}

export const setIOReady = () => {
    IO = socketCon.getIO();
    QUEUE = QUE.QueueManager.getInstance();
}

export const getQueue = () => {
    return QUEUE;
}

export const getIO = (): SocketIO => {
    return IO;
}

export const generateNewRandomQuestion = async () =>{
    const questions: Question[] = await Questions.find({ status: 'ODOBRENO' });
    const question: Question = JSON.parse(JSON.stringify(questions[getRandomNumber(questions.length)]));
    return question;
}


export const startDBTournament = async (socket: Socket, data: EmittedLoggedInData) => {
    let tournamentRoom = await Room.findOne({ room_id: data.roomName });
    const amountOfQuestions = data.amountOfQuestions || 15;
    if (!tournamentRoom) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'startDBTournament'
        });
    }
    const io = getIO();
    const question = await generateNewRandomQuestion();

    tournamentRoom.current_question = question;
    tournamentRoom.question_counter = amountOfQuestions;
    tournamentRoom.total_questions = amountOfQuestions;
    await tournamentRoom.save();
    io.to(`${data.roomName}`).emit(EVENTS.TOURNAMENT_STARTING(), { event: EVENTS.TOURNAMENT_STARTING() });
}


export const startDBTournamentQuestion = async (io: SocketIO, data: EmittedLoggedInData) => {
    try{
        const room = await Room.findOne({ room_id: data.roomName })
        if (!room) {
            return io.in(`${data.roomName}`).emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
                event: `${EVENTS.ROOM_DONT_EXIST()}`,
                fn: 'startDBTournamentQuestion'
            });
        }
        if (room.question_counter < 1) {
            room.allow_enter = false;
            await room.save();
            io.in(`${data.roomName}`).emit(EVENTS.TOURNAMENT_FINISHED(), { event: EVENTS.TOURNAMENT_FINISHED(), users: room.users });
            if (data && data.match) {
                const user1 = await Users.findById(room.users[0]._id);
                const user2 = await Users.findById(room.users[1]._id);
                user1.score = user1.score + room.users[0].score;
                user2.score = user2.score + room.users[1].score;
                await user1.save();
                await user2.save();
            }
            return;
        }else{
            let counter = room.question_counter - 1;
            room.question_counter = counter;
            const question = await generateNewRandomQuestion();
            room.current_question = question;
            await room.save();
            io.in(`${data.roomName}`).emit(EVENTS.EVERYONE_ANSWERED(), { event: EVENTS.EVERYONE_ANSWERED(), users: room.users, counter })
        }
    }catch(e){
        console.log(e)
    }
   
   
}


export const checkMatchQuestion = async (socket: Socket, data: EmittedLoggedInData) => {

    try{
        const room = await Room.findOne({ room_id: data.roomName });
    if (!room) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'checkDBTournamentQuestion'
        });
    }
    const question = room.current_question;
    const users: any[] = JSON.parse(JSON.stringify(room.users));
    users.forEach(user => {
        if (user._id === data.user_id) {
            user.answered = true;
            if (data.letter === question.correct_letter) {
                user.score++;
            }
        }
    });
    const io = getIO();
    room.users = users;
    const everyone_answered = users.every((user: any) => user.answered === true);
    if (everyone_answered) {
        const resetUsers = JSON.parse(JSON.stringify(room.users));
        resetUsers.forEach((user: any) => {
            user.answered = false;
        });
        room.users = resetUsers;
        room.total_questions = room.total_questions + 1;
        await room.save();
        io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: resetUsers })
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: resetUsers })
        data.match = true;
        startDBTournamentQuestion(io, data);

    } else {
        await room.save();
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users })
        io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: users })
    }
    }catch(e){
        console.log(e)
    }
    

}



export const checkDBTournamentQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    try{
        if(data.match){
            return checkMatchQuestion(socket, data)
        }
        const room = await Room.findOne({ room_id: data.roomName });
        if (!room) {
            return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
                event: `${EVENTS.ROOM_DONT_EXIST()}`,
                fn: 'checkDBTournamentQuestion'
            });
        }
        const question = room.current_question;
        const users = JSON.parse(JSON.stringify(room.users));
        users.forEach((user: any) => {
            if (user._id === data.user_id) {
                user.answered = true;
                if (data.letter === question.correct_letter) {
                    user.score++;
                }
            }
        });
        const io = getIO();
        room.users = users;
        const everyone_answered = room.users.every((user: any) => user.answered === true);
        if (everyone_answered) {
            const resetUsers = JSON.parse(JSON.stringify(room.users));
            resetUsers.forEach((user: any) => {
                user.answered = false;
            });
            room.users = resetUsers;
            room.total_questions = room.total_questions + 1;
            await room.save();
            io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: room.users })
            socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users })
            startDBTournamentQuestion(io, data);
    
        } else {
            await room.save();
            socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users })
            io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: room.users })
        }
    }catch(e){
        console.log(e)
    }
    

}


export const declineOponent = (socket: Socket, data: EmittedLoggedInData) => {

    QUEUE.declineOpponent(data.oponentID, data.data._id, data.roomName)
}

export const acceptDBOponent = (socket: Socket, data: EmittedLoggedInData) => {
    QUEUE.acceptOpponent(data.oponentID, data.data._id, data.roomName)
}

export const leaveDBOneOnOne = (socket: Socket, data: EmittedLoggedInData) => {
    socket.emit(EVENTS.LEAVE_ONE_ON_ONE(), { event: EVENTS.LEAVE_ONE_ON_ONE(), success: true })
}
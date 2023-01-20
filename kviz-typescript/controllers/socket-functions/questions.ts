import { EmittedLoggedInData, Question, Socket, UserType } from "../../intrfaces/types";

const Room = require('../../db_models/rooms');
const EVENTS = require('../socket-events');
const Questions = require('../../db_models/question');
const Users = require('../../db_models/user');
const DBQUEUE = require('../DB-queue').getDBQueue();

const checkQuestionQueue: any[] = [];



let generator = function* () {
    while (checkQuestionQueue.length > 0) {
        yield checkQuestionQueue[0]();
    }
};

var queGen = generator();

function handle(yielded: any) {
    if (checkQuestionQueue.length > 0 && yielded && yielded.value) {
        yielded.value.then(() => {
            checkQuestionQueue.shift();
            console.log('Saved from generator')
            return handle(queGen.next())
        })
    } else {
        setTimeout(() => {
            if (checkQuestionQueue.length > 0) {
                queGen = generator();
                console.log('Found in queue')
                return handle(queGen.next())
            }
            return handle(queGen.next())
        }, 200)
    }
}

handle(queGen.next())



function getRandomNumber(quantity: number) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(Math.random() * Math.floor(milliseconds * quantity / 1000))
}

export const getDBQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    const tournamentRoom = await Room.findOne({ room_id: data.roomName });
    if (!tournamentRoom || !tournamentRoom.allow_enter) {
        socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: `getDBQuestion()|requestedRoom:${data.roomName}|respondedRoom: ${tournamentRoom.room_id}|allow: ${tournamentRoom.allow_enter}`
        });
    }
    if (!tournamentRoom.questions[data.questionIndex]){
        socket.emit(EVENTS.TOURNAMENT_FINISHED(), { event: EVENTS.TOURNAMENT_FINISHED(), data: null })
    }
    socket.emit(EVENTS.GET_ROOM_QUESTION(), { event: EVENTS.GET_ROOM_QUESTION(), question: tournamentRoom.questions[data.questionIndex] })
    return true
}

export const generateRoomQuestions = async (roomName: string, amount: number, usersArr: any[]) => {
    const tournamentRoom = await Room.findOne({ room_id: roomName });
    const amountOfQuestions = amount;

    const questions: Question[] = await Questions.find({ status: 'ODOBRENO' });
    const room_questions: Question[] = [];

    async function generateQuestions() {
        return new Promise((resolve, reject) => {
            function generate() {
                if (room_questions.length <= amountOfQuestions) {
                    setTimeout(() => {
                        let filtered = questions.filter(quest => {
                            if (room_questions.some(q => q._id === quest._id)) {
                                return false;
                            } else {
                                return true;
                            }
                        })
                        let random = getRandomNumber(filtered.length);
                        let question = filtered[random];
                        room_questions.push(question);
                        generate();
                    }, Math.round(Math.random()) * 10)

                } else {
                    resolve(true)
                }
            }
            generate()
        })

    }
    await generateQuestions();
    tournamentRoom.questions = room_questions;
    tournamentRoom.users = usersArr;
    await tournamentRoom.save();
}



export const getQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    const id = data.data._id;
    const user = await Users.findById(id);
    user.allready_answered = user.allready_answered || [];
    const category = data.category;
    user.playing = true;
    await user.save();
    if (!id) {
        return // no id for question found
    }
    let questions: Question[];
    if (category && category !== 'RAZNO') {
        questions = await Questions.find({ status: 'ODOBRENO', category: category });
    } else {
        questions = await Questions.find({ status: 'ODOBRENO' });
    }

    let questionsByOthers: Question[] = [];
    questions.forEach(q => {
        if (q._id.toString() !== id) {
            questionsByOthers.push(q);
        }
    });
    questionsByOthers = questionsByOthers.filter(question => !user.allready_answered.includes(question._id));
    if (!questionsByOthers.length) {
        questions.forEach(q => {
            if (q._id.toString() !== id) {
                questionsByOthers.push(q);
            }
        });
        user.allready_answered = [];
        await user.save()
    }
    let random = getRandomNumber(questionsByOthers.length - 1);
    if (questionsByOthers && questionsByOthers.length) {
        let ques = questionsByOthers[random];
        if(ques){
            console.log('got question random')
            let picked = JSON.parse(JSON.stringify(questionsByOthers[random]));
            user.allready_answered.push(picked._id)
            await user.save();
            picked.correct_text = 'Ma da neces odgovor mozda :)';
            picked.correct_letter = 'Saznaces nakon sto izaberes';
            socket.emit(EVENTS.GET_QUESTION(), { event: EVENTS.GET_QUESTION(), data: picked })
        }else{
            console.log('no random question')
        }
       
    } else {
        return //empty question list
    }

}

export const loadQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    const question = await Questions.findById(data.question_id);
    if(question){
        socket.emit(EVENTS.LOAD_SINGLE_QUESTION(), {event: EVENTS.LOAD_SINGLE_QUESTION(), data: question});
    }
}



export const publishQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    const id = data.question_id;
    const root = data.data.roles.some(role => role === 'ADMIN')
    const result = await Questions.findByIdAndUpdate(id, { status: 'ODOBRENO' });
    if (result) {
        return socket.emit(EVENTS.PUBLISH_QUESTION(), { event: EVENTS.PUBLISH_QUESTION(), data: true })
    }
    return socket.emit(EVENTS.PUBLISH_QUESTION(), { event: EVENTS.PUBLISH_QUESTION(), data: false })
}

export const unpublishQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    const id = data.question_id;
    const reason = data.deny_reason || 'Nije definisan';
    const result = await Questions.findByIdAndUpdate(id, { status: 'ODBIJENO', deny_reason: reason });
    if (result) {
        return socket.emit(EVENTS.UNPUBLISH_QUESTION(), { event: EVENTS.UNPUBLISH_QUESTION(), data: true })
    }
    return socket.emit(EVENTS.UNPUBLISH_QUESTION(), { event: EVENTS.UNPUBLISH_QUESTION(), data: false })
}

export const updateQuestionText = async (socket: Socket, data: any) => {
    const id = data.data.id;
    const text = data.data.text;
    const result = await Questions.findByIdAndUpdate(id, { question: text, status: 'NA CEKANJU' });
    if (result) {
        return socket.emit(EVENTS.UPDATE_QUESTION_TEXT(), { event: EVENTS.UPDATE_QUESTION_TEXT(), data: true })
    }
    return socket.emit(EVENTS.UPDATE_QUESTION_TEXT(), { event: EVENTS.UPDATE_QUESTION_TEXT(), data: false })
}

export const getAllQuestions = async (socket: Socket, data: EmittedLoggedInData) => {
    const id = data.data._id;
    const root = data.data.roles.some(role => role === 'ADMIN');
    const filter = data.filter;
    let questions;
    if (!filter) {
        if (root) {
            questions = await Questions.find();
        } else {
            questions = await Questions.find({ posted_by: id });
        }

    } else {
        if (root) {
            questions = await Questions.find({ category: filter });
        } else {
            questions = await Questions.find({ posted_by: id, category: filter });
        }
    }
    if (questions.length) {
        socket.emit(EVENTS.GET_QUESTIONS(), { event: EVENTS.GET_QUESTIONS(), data: questions })
    } else {
        socket.emit(EVENTS.GET_QUESTIONS(), { event: EVENTS.GET_QUESTIONS(), data: [] })
    }
}

export const addQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    const questionText = data.question.question || 'Pitanje sa slikom';
    const correct_letter = data.question.correct_letter || 'B';
    const correctText = data.question.correct_text || 'Some correct answer';
    const category = data.question.category.toUpperCase();
    const allAnswers = data.question.answers;
    const imageUrl = data.question.imageUrl;
    const type = data.question.type;
    const id = data.data._id.toString();
    const question = new Questions({
        question: questionText,
        correct_letter: correct_letter,
        correct_text: correctText,
        posted_by: id,
        category: category,
        answers: allAnswers,
        imageUrl: imageUrl,
        type: type,
        status: 'NA CEKANJU'
    });

    DBQUEUE.addToQueue(question)
    const userDoc: UserType = await Users.findById(data.data._id.toString());
    if (userDoc) {
        const userCat = userDoc.categories.some(cat => cat.category === category);
        if (!userCat) {
            userDoc.categories.push({ category: category, questions_added: 1 })
        } else {
            userDoc.categories.forEach(cat => {
                if (cat.category === category) {
                    cat.questions_added += 1;
                }
            })
        }
        await userDoc.save();
    }
    socket.emit(EVENTS.ADD_QUESTION(), {event: EVENTS.ADD_QUESTION(), data: true})
}




export const addWordQuestion = async (socket: Socket, data: EmittedLoggedInData) => {
    const questionText = data.question.question || 'Pitanje sa slikom';
    const category = data.question.category.toUpperCase();
    const hint = data.question.hint;
    const id = data.data._id.toString();
    const correct_text = data.question.correct_text;
    const question = new Questions({
        question: questionText,
        posted_by: id,
        correct_text: correct_text,
        hint: hint,
        category: category,
        answers: wordBreak(),
        type: 'WORD',
        status: 'NA CEKANJU'
    });

    function wordBreak() {
        let name: string = correct_text;
        let words: any[] = name.split(' ');
        words = words.map(n => {
            n = n.split('')
            n.sort();
            return n;
        })
        return words;
    }
    DBQUEUE.addToQueue(question)
    
    const userDoc: UserType = await Users.findById(data.data._id.toString());
    if (userDoc) {
        const userCat = userDoc.categories.some(cat => cat.category === category);
        if (!userCat) {
            userDoc.categories.push({ category: category, questions_added: 1 })
        } else {
            userDoc.categories.forEach(cat => {
                if (cat.category === category) {
                    cat.questions_added += 1;
                }
            })
        }
        await userDoc.save();
    }
    socket.emit(EVENTS.ADD_QUESTION(), { event: EVENTS.ADD_QUESTION(), data: question })
}

export const deleteQuestion = async (socket: Socket, data: EmittedLoggedInData) =>{
    const id = data.question_id || null;
    if(!id){
        return;
    }
    await Questions.findByIdAndDelete(id);
    const userId: string = data.data._id;
    const root = data.data.roles.some(role => role === 'ADMIN')
    const questions: Question[] = await Questions.find();
    const questionsByOthers: Question[] = [];
    if(!questions){
        return socket.emit(EVENTS.DATABASE_CONNECTION_ERROR(), { event: EVENTS.DATABASE_CONNECTION_ERROR(), data: null })
    }
    questions.forEach(q => {
        if (!root) {
            if (q._id.toString() === userId) {
                questionsByOthers.push(q);
            }
        } else {
            questionsByOthers.push(q)
        }

    });
    if (questionsByOthers.length) {
        return socket.emit(EVENTS.DELETE_QUESTION(), {event: EVENTS.DELETE_QUESTION(), success: true, data: questionsByOthers})
    }
    return socket.emit(EVENTS.DELETE_QUESTION(), {event: EVENTS.DELETE_QUESTION(), success: true, data: []})
    
}

export const checkQuestion = async (socket: Socket, data: EmittedLoggedInData) =>{
    const userPick = data.correct;
    const questionID = data.question_id;
    const isWordQuestion = data.isWord;
    let correct = false;
    const user: UserType = await Users.findById(data.data._id);
    let category = '';
    Questions.findById(questionID).then((question: Question) =>{
        if (question){
            let timesPicked = question.question_picked + 1;
            let difficulty = (question.answered_correctly / timesPicked) * 100;
            question.question_difficulty = difficulty;
            question.question_picked = timesPicked;
            if(!isWordQuestion){
                if (userPick === question.correct_letter) {
                    correct = true;
                    question.answered_correctly++;
                    category = question.category;
                } else {
                    question.answered_wrong++;
                    category = question.category;
                }
                checkQuestionQueue.push(question)
                
                return question;
            }else{
                if (userPick.toUpperCase() === question.correct_text.toUpperCase()) {
                    correct = true;
                    question.answered_correctly++;
                    category = question.category;
                } else {
                    question.answered_wrong++;
                    category = question.category;
                }
                // DBQUEUE.addToQueue(question);
                checkQuestionQueue.push(question)
                return question;
            }

        }
    })
    .then(async () =>{
        if(user){
            let hasAchievement = user.achievements.some(achievement => achievement.category === category)
            if(!hasAchievement){
                user.achievements.push({
                    category: category,
                    answered: 1
                })
            }else{
                if(correct){
                    user.achievements.forEach(achievement =>{
                        if(achievement.category === category){
                            achievement.answered += 1;
                        }
                    })
                }
            }
    
            return user.save();
        }
    })
    .then((saved: UserType) =>{
        return socket.emit(EVENTS.CHECK_PRACTICE_QUESTION(), { event: EVENTS.CHECK_PRACTICE_QUESTION(), data: correct})
    })
}

export const quizResults = async (req: any, res: any, next: any) =>{

}

export const reduceLives = async (socket: Socket, data: EmittedLoggedInData) => {
    const id = data.data._id;
    Users.findById(id).then((user: UserType) =>{
        if(user){
            if(user.lives > 0){
                user.lives--;
                if (user.lives === 0 && !user.lives_reset_timer_set){
                    let now = Date.now();
                    let future = now + 122000;
                    user.lives_timer_ms = future - now;
                    user.reset_lives_at = future;
                    user.lives_reset_timer_set = true;
                }
                if(user.reset_lives_at > Date.now()){
                    user.lives_timer_ms = user.reset_lives_at - Date.now();
                }
                return user.save()
            }
            if(user.reset_lives_at > Date.now()){
                user.lives_timer_ms = Math.round((user.reset_lives_at - Date.now()) / 1000);
            }
            return user.save();
        }
    })
    .then((saved: UserType) =>{
        return socket.emit(EVENTS.REDUCE_LIVES(), {event: EVENTS.REDUCE_LIVES(), data: saved})
    })
}


export const resetQuestions = async () =>{
    const questions: Question[] = await Questions.find();
    questions.forEach(question => {
        question.answered_correctly = 0;
        question.question_difficulty = 1;
        question.answered_wrong = 0;
        question.question_picked = 0;
        DBQUEUE.addToQueue(question);
    })
}
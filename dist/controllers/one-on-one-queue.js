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
exports.QueueManager = void 0;
const TOURNAMENT = require('./socket-functions/tournament');
const EVENTS = require('./socket-events');
const ROOM = require('./socket-functions/room');
const crypto = require('crypto');
class QueueManager {
    constructor() {
        throw new Error('Use QueueManager.getInstance()');
    }
    static getInstance() {
        if (!PrivateQueueManager.instance) {
            PrivateQueueManager.instance = new PrivateQueueManager();
        }
        return PrivateQueueManager.instance;
    }
}
exports.QueueManager = QueueManager;
QueueManager.instance = null;
class GenerateMatch {
    constructor(user1, user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.roomIDLength = 5;
        this.generated = null;
        this.randomValue = () => {
            return crypto.randomBytes(Math.ceil(this.roomIDLength / 2))
                .toString('hex')
                .slice(0, this.roomIDLength).toUpperCase();
        };
        this.user1 = user1;
        this.user2 = user2;
        this.generated = this.generate();
        return this.generated;
    }
    generate() {
        return [
            { roomName: this.randomValue(), busy: false },
            this.user1,
            this.user2
        ];
    }
}
class PrivateQueueManager {
    constructor() {
        this.queue = [];
        this.playing = [];
        this.debounceBotUserTimeot = null;
        this.io = TOURNAMENT.getIO();
    }
    addToQueue(user) {
        this.queue = this.queue.filter((useItem) => useItem._id !== user._id);
        this.queue.push(user);
        this.queue.sort((a, b) => a.score - b.score);
        this.generateMatches();
        this.checkForMatch();
        this.io.emit(EVENTS.TRACK_QUEUE_MANAGER(), { event: EVENTS.TRACK_QUEUE_MANAGER(), data: { queue: this.queue, playing: this.playing } });
        return this;
    }
    generateMatches() {
        let counter = 0;
        while (counter < this.queue.length - 1) {
            counter++;
            const match = new GenerateMatch(this.queue[0], this.queue[1]);
            this.playing.push(match);
            this.queue = this.queue.filter((item, index) => index !== 0 && index !== 1);
        }
        return this;
    }
    checkForMatch() {
        let i = 0;
        while (i <= this.playing.length - 1) {
            if (!this.playing[i][0].busy) {
                this.playing[i][0].busy = true;
                this.io.in(this.playing[i][1]._id.toString()).emit(EVENTS.MATCH_FOUND(), { event: EVENTS.MATCH_FOUND(), data: { me: this.playing[i][1], roomName: this.playing[i][0].roomName, oponent: this.playing[i][2] } });
                this.io.in(this.playing[i][2]._id.toString()).emit(EVENTS.MATCH_FOUND(), { event: EVENTS.MATCH_FOUND(), data: { me: this.playing[i][2], roomName: this.playing[i][0].roomName, oponent: this.playing[i][1] } });
            }
            i++;
        }
    }
    startMatch(roomName, user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            const { success } = yield ROOM.createMatchRoom(roomName, [user1, user2]);
            if (!success) {
                return;
            }
            this.io.in(roomName).emit(EVENTS.BOTH_ACCEPTED(), { event: EVENTS.BOTH_ACCEPTED(), data: true });
        });
    }
    acceptOpponent(oponentID, myID, roomName) {
        const myRoom = this.playing.find((match) => match[0].roomName === roomName);
        if (!myRoom) {
            return;
        }
        myRoom.forEach((item) => {
            if (item._id && item._id === myID) {
                item.gameAccepted = true;
            }
        });
        const user1 = myRoom[1];
        const user2 = myRoom[2];
        user1.answered = false;
        user2.answered = false;
        if (user1.gameAccepted && user2.gameAccepted) {
            this.startMatch(roomName, user1, user2);
        }
        else {
            this.io.in(oponentID.toString()).emit(EVENTS.OPONENT_ACCEPTED(), { event: EVENTS.OPONENT_ACCEPTED(), data: true });
        }
    }
    declineOpponent(oponentID, myID, roomName) {
        this.io.in(oponentID.toString()).emit(EVENTS.OPONENT_DECLINED(), { event: EVENTS.OPONENT_DECLINED(), data: true });
        this.playing = this.playing.filter((item) => item[0].roomName !== roomName);
    }
    matchFinished(roomName) {
        this.playing = this.playing.filter((match) => match[0].roomName !== roomName);
        this.io.emit(EVENTS.TRACK_QUEUE_MANAGER(), { event: EVENTS.TRACK_QUEUE_MANAGER(), data: { queue: this.queue, playing: this.playing } });
    }
}
PrivateQueueManager.instance = null;

import { SocketIO } from "../intrfaces/types";

export { }
const TOURNAMENT = require('./socket-functions/tournament');
const EVENTS = require('./socket-events');
const ROOM = require('./socket-functions/room')
const crypto = require('crypto');

export class QueueManager{
    static instance = null;

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






class GenerateMatch{
    roomIDLength = 5;
    private generated = null as any;
    constructor(private user1: any, private user2: any) {
        this.user1 = user1;
        this.user2 = user2;
        this.generated = this.generate();
        return this.generated;
    }

    randomValue = () => {
        return crypto.randomBytes(Math.ceil(this.roomIDLength / 2))
            .toString('hex')
            .slice(0, this.roomIDLength).toUpperCase();
    }

    generate() {
        return [
            { roomName: this.randomValue(), busy: false },
            this.user1,
            this.user2
        ]
    }
}




class PrivateQueueManager{
    public queue: any = [];
    public playing: any = [];
    public io: SocketIO;
    public static instance = null as any;

    constructor(){this.io = TOURNAMENT.getIO(); }
    
    addToQueue(user: any){
        this.queue = this.queue.filter((useItem: any) => useItem._id !== user._id);
        this.queue.push(user);
        this.queue.sort((a: any,b: any) => a.score - b.score);
        this.generateMatches();
        this.checkForMatch();
        this.io.emit(EVENTS.TRACK_QUEUE_MANAGER(), { event: EVENTS.TRACK_QUEUE_MANAGER(), data: { queue: this.queue, playing: this.playing }  });
        return this;
    }

    generateMatches(){
        let counter = 0;
        while (counter < this.queue.length - 1){
            counter++;
            const match = new GenerateMatch(this.queue[0], this.queue[1])
            this.playing.push(match);
            this.queue = this.queue.filter((item: any, index: number) => index !== 0 && index !== 1);
        }
        return this;
    }

    checkForMatch(){
        let i = 0;
        while(i <= this.playing.length - 1){
            if(!this.playing[i][0].busy){
                this.playing[i][0].busy = true;
                this.io.in(this.playing[i][1]._id.toString()).emit(EVENTS.MATCH_FOUND(), {event: EVENTS.MATCH_FOUND(), data: {me: this.playing[i][1],roomName: this.playing[i][0].roomName,oponent: this.playing[i][2]}});
                this.io.in(this.playing[i][2]._id.toString()).emit(EVENTS.MATCH_FOUND(), {event: EVENTS.MATCH_FOUND(), data: {me: this.playing[i][2],roomName: this.playing[i][0].roomName,oponent: this.playing[i][1]}});
            }
            i++;
        }
    }

    async startMatch(roomName: string, user1: any, user2: any){
        const { success } = await ROOM.createMatchRoom(roomName, [user1, user2]);
        if(!success){return;}
        console.log('emit to users')
        this.io.in(roomName).emit(EVENTS.BOTH_ACCEPTED(), { event: EVENTS.BOTH_ACCEPTED(), data: true });
    }

    acceptOpponent(oponentID: string, myID: string, roomName: string){
        const myRoom = this.playing.find((match: any) => match[0].roomName === roomName);
        if(!myRoom){return;}
        myRoom.forEach((item: any) => {
            if(item._id && item._id === myID){
                item.gameAccepted = true;
            }
        });
        const user1 = myRoom[1];
        const user2 = myRoom[2];
        user1.answered = false;
        user2.answered = false;
        if (user1.gameAccepted && user2.gameAccepted){
            this.startMatch(roomName,user1,user2);
        }else{
            this.io.in(oponentID.toString()).emit(EVENTS.OPONENT_ACCEPTED(), { event: EVENTS.OPONENT_ACCEPTED(), data: true });
        }
       
    }

    declineOpponent(oponentID: string, myID: string, roomName: string) {
        this.io.in(oponentID.toString()).emit(EVENTS.OPONENT_DECLINED(), { event: EVENTS.OPONENT_DECLINED(), data: true });
        this.playing = this.playing.filter((item: any) => item[0].roomName !== roomName);
    }

    matchFinished(roomName: string){
        this.playing = this.playing.filter((match: any) => match[0].roomName !== roomName);
        this.io.emit(EVENTS.TRACK_QUEUE_MANAGER(), { event: EVENTS.TRACK_QUEUE_MANAGER(), data: { queue: this.queue, playing: this.playing } });
    }
}



import { SocketIO } from "./intrfaces/types";

let io: SocketIO;

export const initialized = false;

module.exports = {
    init: (httpServer: any) => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "*"
            }
        });
        return io;
    },
    getIO: () =>{
        if(!io){
            throw new Error('Socket.io not initialized!')
        }
        return io;
    }
}
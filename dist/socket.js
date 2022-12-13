"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialized = void 0;
let io;
exports.initialized = false;
module.exports = {
    init: (httpServer) => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "*"
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIOError = exports.handleSocketError = exports.handleError = void 0;
const ErrorDB = require('../db_models/errors');
const handleError = (fn) => {
    return (req, res, next) => {
        try {
            fn(req, res, next);
        }
        catch (error) {
            const err = new ErrorDB({
                message: String(error),
                caused_by: fn.name
            });
            err.save();
        }
    };
};
exports.handleError = handleError;
const handleSocketError = (fn, socket, data) => {
    fn(socket, data)
        .catch((error) => console.log(error));
};
exports.handleSocketError = handleSocketError;
const handleIOError = (fn, io, socket, data) => {
    fn(io, socket, data)
        .catch((error) => console.log(error));
};
exports.handleIOError = handleIOError;

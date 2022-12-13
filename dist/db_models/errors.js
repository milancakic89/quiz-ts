"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ErrorDB = new Schema({
    message: String,
    caused_by: String
});
module.exports = mongoose.model('Error', ErrorDB);

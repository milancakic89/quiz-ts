"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const achievement = new Schema({
    category: { type: String, required: true },
    achiveText: { type: String, required: true },
    achievedAt: { type: Number, required: true }
});
module.exports = mongoose.model('Achievement', achievement);

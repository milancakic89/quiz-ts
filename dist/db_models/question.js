"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const questionSchema = new Schema({
    question: { type: String, required: true },
    correct_letter: { type: String, required: false },
    correct_text: { type: String, required: false },
    answered_correctly: { type: Number, required: false, default: 0 },
    question_difficulty: { type: Number, required: false, default: 1 },
    answered_wrong: { type: Number, required: false, default: 0 },
    question_picked: { type: Number, required: false, default: 0 },
    posted_by: { type: String, required: false, default: 'USER' },
    category: String,
    deny_reason: { type: String, required: false },
    hint: { type: String, required: false },
    type: { type: String, required: false, default: 'REGULAR' },
    imageUrl: { type: String, required: false },
    status: { type: String, required: true, default: "NA CEKANJU" },
    answers: [],
});
module.exports = mongoose.model('Question', questionSchema);

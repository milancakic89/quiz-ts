"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const room = new Schema({
    room_id: { type: String, required: true },
    current_question: { type: Object, required: false, default: null },
    questions: { type: Object, required: false, default: [] },
    answered_question_ids: [],
    startsAt: { type: Number, required: false },
    users: [
        { type: Object, required: true }
    ],
    started: { type: Boolean, required: true, default: false },
    total_questions: { type: Number, required: true, default: 0 },
    question_counter: { type: Number, required: true, default: 0 },
    allow_enter: { type: Boolean, required: true, default: true },
    created_by: String
});
module.exports = mongoose.model('Rooms', room);

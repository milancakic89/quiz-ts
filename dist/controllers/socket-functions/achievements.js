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
exports.createAchievements = exports.getAchievements = void 0;
const Achievement = require('../../db_models/achievement');
const User = require('../../db_models/user');
const EVENTS = require('../socket-events');
const getAchievements = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const achievements = yield Achievement.find();
    const user = yield User.findById(data.data._id);
    const userAchievements = user.achievements;
    const modifiedAchievements = [];
    user.notifications.achievements = false;
    yield user.save();
    if (achievements && achievements.length && userAchievements && userAchievements.length) {
        for (let i = 0; i < userAchievements.length; i++) {
            for (let j = 0; j < achievements.length; j++) {
                if (userAchievements[i].category === achievements[j].category) {
                    modifiedAchievements.push({
                        category: achievements[j].category,
                        achiveText: achievements[j].achiveText,
                        achievedAt: achievements[j].achievedAt,
                        answered: userAchievements[i].answered,
                        price_received: userAchievements[i].answered > achievements[j].achievedAt
                    });
                }
            }
        }
        socket.emit(EVENTS.GET_ACHIEVEMENTS(), { event: EVENTS.GET_ACHIEVEMENTS(), data: modifiedAchievements || [] });
    }
    else {
        socket.emit(EVENTS.GET_ACHIEVEMENTS(), { event: EVENTS.GET_ACHIEVEMENTS(), data: [] });
    }
});
exports.getAchievements = getAchievements;
const createAchievements = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const achScores = [30, 60, 100, 200, 500, 1000, 5000, 10000]
    // let counter = 0;
    // function save(){
    //   return new Promise((resolve, reject) =>{
    //     let ach = new Achievement({
    //       category: "RAZNO",
    //       achiveText: `${achScores[counter]} pogodjenih pitanja`,
    //       achievedAt: achScores[counter]
    //     })
    //     ach.save().then(()=>{
    //       counter++
    //       console.log('saved')
    //       resolve(true)
    //     })
    //   })
    // }
    // async function next(){
    //   console.log('triggering')
    //   await save();
    //   console.log('after save')
    //   if(counter <= achScores.length - 1){
    //     next();
    //   }
    // }
    // next();
});
exports.createAchievements = createAchievements;

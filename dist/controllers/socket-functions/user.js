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
exports.getShopItemCost = exports.buyItem = exports.removeNotification = exports.updateSettings = exports.updateScore = exports.resetLives = exports.resetPlayingState = exports.resetDailyPrice = exports.getRankingList = void 0;
const types_1 = require("../../intrfaces/types");
const User = require('../../db_models/user');
const EVENTS = require('../socket-events');
const lifeItems = ['LIFE_X_1', 'LIFE_X_2', 'LIFE_X_3'];
function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity / 1000);
}
const getRankingList = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    let users = yield User.find();
    const rankedUsers = users.sort((a, b) => a.score - b.score);
    let top100;
    if (rankedUsers.length > 100) {
        top100 = rankedUsers.splice(0, 100);
    }
    else {
        top100 = rankedUsers;
    }
    return socket.emit(EVENTS.GET_RANKING_LIST(), { event: EVENTS.GET_RANKING_LIST(), data: top100 });
});
exports.getRankingList = getRankingList;
const resetDailyPrice = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const id = data.data._id;
    const user = yield User.findById(id);
    const ticketPrice = [1, 1, 5, 1, , 1, 1, 2, 1, , 3, 1, 1, 1, 2, , 1, 10, 1, 1, 3, 1, , 4, 1, 1, 2, 1, , 4, 1, 1, 1, 2, 1, 1, 3, 1, 1];
    const random = getRandomNumber(ticketPrice.length - 1);
    if (user) {
        const now = Date.now();
        if (now >= user.daily_price) {
            const oneDay = 24 * 60 * 60 * 1000;
            user.tickets += ticketPrice[random];
            const tomorow = now + oneDay;
            user.daily_price = tomorow;
        }
        yield user.save();
        return socket.emit(EVENTS.GET_DAILY_REWARD(), { event: EVENTS.GET_DAILY_REWARD(), data: user, tickets: ticketPrice[random] });
    }
    else {
        return socket.emit(EVENTS.GET_DAILY_REWARD(), { event: EVENTS.GET_DAILY_REWARD(), data: null, tickets: 0 });
    }
});
exports.resetDailyPrice = resetDailyPrice;
const resetPlayingState = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findById(data.data._id);
    user.playing = false;
    const saved = yield user.save();
    if (saved) {
        return socket.emit(EVENTS.RESET_PLAYING_STATE(), { event: EVENTS.RESET_PLAYING_STATE(), data: true });
    }
    return socket.emit(EVENTS.RESET_PLAYING_STATE(), { event: EVENTS.RESET_PLAYING_STATE(), data: false });
});
exports.resetPlayingState = resetPlayingState;
const resetLives = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findById(data.data._id);
    if (user) {
        if (user.reset_lives_at > Date.now()) {
            user.lives_timer_ms = Math.round((user.reset_lives_at - Date.now()) / 1000);
        }
        yield user.save();
        socket.emit(EVENTS.RESET_LIVES(), { event: EVENTS.RESET_LIVES(), data: user });
    }
    else {
        socket.emit(EVENTS.RESET_LIVES(), { event: EVENTS.RESET_LIVES(), data: null });
    }
});
exports.resetLives = resetLives;
const updateScore = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const score = data.score;
    const user = yield User.findById(data.data._id);
    user.score = score;
    user.playing = false;
    const saved = yield user.save();
    if (saved) {
        return socket.emit(EVENTS.UPDATE_SCORE(), { data: true });
    }
    return socket.emit(EVENTS.UPDATE_SCORE(), { data: false });
});
exports.updateScore = updateScore;
const updateSettings = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = data.settings.name;
        const border = data.settings.avatar_border || '';
        const avatar = data.settings.image || 'https://firebasestorage.googleapis.com/v0/b/kviz-live.appspot.com/o/1642193033985png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black.png?alt=media';
        console.log(avatar);
        const userDoc = yield User.findById(data.data._id);
        if (userDoc) {
            userDoc.name = name;
            userDoc.avatar_url = avatar;
            userDoc.avatar_border = border;
            userDoc.save();
            return socket.emit(EVENTS.UPDATE_SETTINGS(), { event: EVENTS.UPDATE_SETTINGS(), success: true, data: userDoc });
        }
        return socket.emit(EVENTS.UPDATE_SETTINGS(), { event: EVENTS.UPDATE_SETTINGS(), success: false, data: null });
    }
    catch (e) {
        console.log(e);
    }
});
exports.updateSettings = updateSettings;
const removeNotification = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findById(data.data._id);
    if (user) {
        user.requestNotification = false;
        yield user.save();
        return socket.emit(EVENTS.REMOVE_NOTIFICATION(), { event: EVENTS.REMOVE_NOTIFICATION(), data: user, success: true });
    }
});
exports.removeNotification = removeNotification;
const buyItem = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findById(data.data._id);
    if (user && data.item) {
        if (user.tickets >= (0, exports.getShopItemCost)(data.item)) {
            if (!user.shop_items.includes(data.item) && !lifeItems.includes(data.item)) {
                user.avatar_border = data.item;
                const userItems = JSON.parse(JSON.stringify(user.shop_items));
                userItems.push(data.item);
                user.shop_items = userItems;
                user.tickets = user.tickets - (0, exports.getShopItemCost)(data.item);
                yield user.save();
                socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: data.item, data: user, message: 'Kupljeno' });
            }
            else {
                socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: data.item, data: user, message: 'Vec kupljeno' });
            }
            if (lifeItems.includes(data.item)) {
                const lifes = +data.item.charAt(data.item.length - 1);
                user.lives = user.lives + lifes;
                user.tickets = user.tickets - (0, exports.getShopItemCost)(data.item);
                yield user.save();
                socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: data.item, data: user, message: 'Kupljeno' });
            }
        }
        else {
            socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: null, data: user, message: 'Nedovoljno tiketa' });
        }
    }
});
exports.buyItem = buyItem;
const getShopItemCost = (item) => {
    switch (item) {
        case types_1.ShopItem.ADMIN:
            return types_1.ShopItemPrice.ADMIN;
        case types_1.ShopItem.NATURE:
            return types_1.ShopItemPrice.NATURE;
        case types_1.ShopItem.IRON_CROWN:
            return types_1.ShopItemPrice.IRON_CROWN;
        case types_1.ShopItem.MASTER:
            return types_1.ShopItemPrice.MASTER;
        case types_1.ShopItem.PORTAL:
            return types_1.ShopItemPrice.PORTAL;
        case types_1.ShopItem.REGULAR:
            return types_1.ShopItemPrice.REGULAR;
        case types_1.ShopItem.SLIME:
            return types_1.ShopItemPrice.SLIME;
        case types_1.ShopItem.LIFE_X_1:
            return types_1.ShopItemPrice.LIFE_X_1;
        case types_1.ShopItem.LIFE_X_2:
            return types_1.ShopItemPrice.LIFE_X_2;
        case types_1.ShopItem.LIFE_X_3:
            return types_1.ShopItemPrice.LIFE_X_3;
    }
};
exports.getShopItemCost = getShopItemCost;

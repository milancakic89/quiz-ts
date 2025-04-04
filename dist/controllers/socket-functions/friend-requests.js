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
exports.removeFriend = exports.getFriendList = exports.getFriendRequests = exports.searchUsers = exports.acceptDBFriend = exports.addDBFriend = exports.inviteFriends = void 0;
const Users = require('../../db_models/user');
const EVENTS = require('../socket-events');
const TOURNAMENT = require('../socket-functions/tournament');
const inviteFriends = (socket, data) => {
    const IO = TOURNAMENT.getIO();
    if (!data) {
        return socket.emit(EVENTS.DATABASE_CONNECTION_ERROR(), { event: EVENTS.DATABASE_CONNECTION_ERROR(), data: null });
    }
    data.friends.forEach((friend) => {
        IO.in(`${friend._id}`).emit(EVENTS.TOURNAMENT_INVITATION(), { event: EVENTS.TOURNAMENT_INVITATION(), roomName: data.roomName, userName: data.userName });
    });
};
exports.inviteFriends = inviteFriends;
const addDBFriend = (socket, socketIo, data) => __awaiter(void 0, void 0, void 0, function* () {
    const requested_friend_ID = data.friend_id;
    const my_id = data.user_id;
    const friend = yield Users.findById(requested_friend_ID);
    if (friend) {
        const friend_requests = friend.friendRequests || [];
        if (!friend_requests.length || !friend_requests.includes(my_id)) {
            friend_requests.push(my_id);
            friend.friendRequests = friend_requests;
            friend.requestNotification = true;
            yield friend.save();
            socketIo.in(`${requested_friend_ID}`).emit(EVENTS.NEW_FRIEND_REQUEST(), { event: EVENTS.NEW_FRIEND_REQUEST(), success: true });
            return socket.emit(EVENTS.ADD_FRIEND(), { event: EVENTS.ADD_FRIEND(), success: true });
        }
        else {
            return socket.emit(EVENTS.FRIEND_ALLREADY_REQUESTED(), { event: EVENTS.FRIEND_ALLREADY_REQUESTED() });
        }
    }
    else {
        return socket.emit(EVENTS.ADD_FRIEND(), { event: EVENTS.ADD_FRIEND(), success: false });
    }
});
exports.addDBFriend = addDBFriend;
const acceptDBFriend = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const requested_friend_ID = data.friend_id;
    const my_id = data.user_id;
    try {
        const friend = yield Users.findById(requested_friend_ID);
        const me = yield Users.findById(my_id);
        if (friend && me) {
            const my_friend_requests = me.friendRequests.filter(req_id => req_id !== requested_friend_ID);
            me.friendRequests = my_friend_requests;
            //if something fails, we want to reverse friends back to original
            const my_previous_friends = JSON.parse(JSON.stringify(me.friends)) || [];
            const friend_previous_friends = JSON.parse(JSON.stringify(friend.friends)) || [];
            //
            let my_friends = JSON.parse(JSON.stringify(my_previous_friends));
            let friend_friends = JSON.parse(JSON.stringify(friend_previous_friends));
            if (!my_friends.includes(requested_friend_ID)) {
                my_friends.push(requested_friend_ID);
            }
            if (!friend_friends.includes(my_id)) {
                friend_friends.push(my_id);
            }
            me.friends = my_friends;
            friend.friends = friend_friends;
            const my_result = yield me.save();
            const friend_result = yield friend.save();
            if (my_result && friend_result) {
                return socket.emit(EVENTS.ACCEPT_FRIEND(), { event: EVENTS.ACCEPT_FRIEND(), success: true, friendRequest: requested_friend_ID });
            }
            else {
                me.friends = my_previous_friends;
                friend.friends = friend_previous_friends;
                yield me.save();
                yield friend.save();
                return socket.emit(EVENTS.ACCEPT_FRIEND(), { event: EVENTS.ACCEPT_FRIEND(), success: false });
            }
        }
        else {
            return socket.emit(EVENTS.ACCEPT_FRIEND(), { event: EVENTS.ACCEPT_FRIEND(), success: false });
        }
    }
    catch (e) {
        console.log(e);
    }
});
exports.acceptDBFriend = acceptDBFriend;
const searchUsers = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = data.query ? data.query.toUpperCase() : '';
        let allUsers;
        allUsers = yield Users.find();
        if (!allUsers) {
            return socket.emit(EVENTS.DATABASE_CONNECTION_ERROR(), { event: EVENTS.DATABASE_CONNECTION_ERROR(), data: null });
        }
        const users = allUsers.filter(user => {
            if (user.name.toUpperCase().includes(filter)) {
                return true;
            }
        });
        let top100;
        if (users.length > 100) {
            top100 = users.splice(0, 100);
        }
        else {
            top100 = users;
        }
        const mapped = top100.map(user => {
            return {
                name: user.name,
                avatar_url: user.avatar_url,
                _id: user._id,
                socket: user.socket,
                online: user.online || false
            };
        });
        return socket.emit(EVENTS.GET_ALL_USERS(), { event: EVENTS.GET_ALL_USERS(), data: mapped });
    }
    catch (e) {
        console.log(e);
    }
});
exports.searchUsers = searchUsers;
const getFriendRequests = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const id = data.data._id;
    const me = yield Users.findById(id);
    const my_requests = me.friendRequests || [];
    const allUsers = yield Users.find();
    const requests = allUsers.filter(user => {
        return my_requests.includes(user._id);
    });
    const mapped = requests.map(user => {
        return {
            name: user.name,
            _id: user._id,
            avatar_url: user.avatar_url,
            socket: user.socket,
            online: user.online || false
        };
    });
    return socket.emit(EVENTS.GET_FRIEND_REQUESTS(), { event: EVENTS.GET_FRIEND_REQUESTS(), data: mapped });
});
exports.getFriendRequests = getFriendRequests;
const getFriendList = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const id = data.data._id;
    const me = yield Users.findById(id);
    const my_friends = me.friends || [];
    const allUsers = yield Users.find();
    const friends = allUsers.filter(user => {
        return my_friends.includes(user._id);
    });
    const mapped = friends.map(user => {
        return {
            name: user.name,
            _id: user._id,
            avatar_url: user.avatar_url,
            socket: user.socket || '123456',
            online: user.online || false
        };
    });
    return socket.emit(EVENTS.GET_FRIEND_LIST(), { event: EVENTS.GET_FRIEND_LIST(), data: mapped });
});
exports.getFriendList = getFriendList;
const removeFriend = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const my_id = data.data._id;
        const remove_id = data.remove_id;
        if (my_id === remove_id) {
            const me = yield Users.findById(my_id);
            me.friends = me.friends.filter(friend_id => friend_id !== remove_id);
            yield me.save();
            socket.emit(EVENTS.REMOVE_FRIEND(), { event: EVENTS.REMOVE_FRIEND(), data: me.friends });
        }
        const me = yield Users.findById(my_id);
        const friend = yield Users.findById(remove_id);
        me.friends = me.friends.filter(friend_id => friend_id !== remove_id);
        friend.friends = friend.friends.filter(friend_id => friend_id !== my_id);
        yield me.save();
        yield friend.save();
        socket.emit(EVENTS.REMOVE_FRIEND(), { event: EVENTS.REMOVE_FRIEND(), data: me.friends });
    }
    catch (e) {
        console.log(e);
    }
});
exports.removeFriend = removeFriend;

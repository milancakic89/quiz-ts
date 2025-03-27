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
exports.resetPasswordConfirmation = exports.resetPassword = exports.activateUser = exports.takeDailyPrice = exports.refresh = exports.facebookLogin = exports.autoLogin = exports.login = exports.signUp = exports.randomValue = void 0;
const Achievements = require('../../db_models/achievement');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oneOnOneRoom = require('../../db_models/one-on-one');
const EVENTS = require('../socket-events');
const User = require('../../db_models/user');
var nodemailer = require('nodemailer');
const randomValue = (len) => {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
};
exports.randomValue = randomValue;
const signUp = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const email = data.email;
    const password = data.password;
    if (!password) {
        return;
    }
    const user = yield User.findOne({ email: email });
    if (user) {
        return socket.emit(EVENTS.EMAIL_ALLREADY_EXIST(), { event: EVENTS.EMAIL_ALLREADY_EXIST(), data: null });
    }
    const hashedPassword = yield bcrypt.hash(password, 12);
    if (hashedPassword) {
        const user = new User({
            email: email,
            password: hashedPassword,
            reset_daily_price: Date.now() + 60 * 60 * 1000,
            roles: ['USER'],
            contributions: [],
            activation_token: (0, exports.randomValue)(20),
            questions: []
        });
        user.save();
        sendEmail(socket, user, 'register');
    }
});
exports.signUp = signUp;
const login = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const email = data.email;
    const password = data.password;
    if (!email || !password) {
        return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), { event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null });
    }
    const userDoc = yield User.findOne({ email: email });
    if (!userDoc) {
        return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), { event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null });
    }
    if (userDoc && !userDoc.account_activated) {
        return socket.emit(EVENTS.ACCOUNT_NOT_ACTIVATED(), { event: EVENTS.ACCOUNT_NOT_ACTIVATED(), data: null });
    }
    if (!userDoc.password) {
        return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), { event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null });
    }
    bcrypt.compare(password, userDoc.password).then((doMatch) => __awaiter(void 0, void 0, void 0, function* () {
        if (doMatch) {
            const dataToSign = {
                email: userDoc.email,
                _id: userDoc._id,
                password: userDoc.password,
                roles: userDoc.roles
            };
            const token = jwt.sign({ user: dataToSign }, process.env.SIGNING_SECRET, { expiresIn: '24h' });
            try {
                const oneOnOne = yield oneOnOneRoom.findOne({ room_id: '1on1' });
                let users = oneOnOne.users || [];
                users = users.filter(id => id !== userDoc._id);
                oneOnOne.users = users;
                yield oneOnOne.save();
            }
            catch (e) {
                console.log('error in one on one bcrypt');
            }
            const data = {
                data: userDoc,
                token: token
            };
            return socket.emit(EVENTS.LOGIN(), { event: EVENTS.LOGIN(), data: data.data, token: data.token });
        }
        else {
            return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), { event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null });
        }
    }));
});
exports.login = login;
const autoLogin = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const email = data.data.email;
    const user = yield User.findOne({ email: email });
    if (!user || !user.account_activated) {
        socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED(), data: null });
        return;
    }
    return socket.emit(EVENTS.AUTOLOGIN(), { event: EVENTS.AUTOLOGIN(), data: user });
});
exports.autoLogin = autoLogin;
const facebookLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    const name = req.body.name;
    const userDoc = yield User.findOne({ fbId: id });
    let token;
    if (userDoc) {
        token = jwt.sign({ user: userDoc }, process.env.SIGNING_SECRET, { expiresIn: '24h' });
        return res.send({
            success: true,
            error: '',
            data: userDoc,
            token
        });
    }
    else {
        const newUser = new User({
            fbId: id,
            name
        });
        yield newUser.save();
        token = jwt.sign({ user: newUser }, process.env.SIGNING_SECRET, { expiresIn: '3h' });
        return res.send({
            success: true,
            error: '',
            data: newUser,
            token
        });
    }
});
exports.facebookLogin = facebookLogin;
const refresh = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.data._id) {
        const userDoc = yield User.findOne({ _id: data.user_id });
        const achievements = yield Achievements.find();
        if (userDoc) {
            for (let i = 0; i < userDoc.achievements.length; i++) {
                for (let j = 0; j < achievements.length; j++) {
                    if (!userDoc.achievements[i].achievement_ticket_ids.includes(achievements[j]._id.toString()) &&
                        userDoc.achievements[i].answered >= achievements[j].achievedAt &&
                        userDoc.achievements[i].category === achievements[j].category) {
                        userDoc.achievements[i].achievement_ticket_ids.push(achievements[j]._id.toString());
                        userDoc.tickets += 1;
                        userDoc.notifications.achievements = true;
                    }
                }
            }
            if (userDoc.lives === 0 && userDoc.lives_reset_timer_set && userDoc.reset_lives_at <= Date.now()) {
                userDoc.lives = 1;
                userDoc.lives_reset_timer_set = false;
            }
            if (userDoc.reset_lives_at > Date.now()) {
                userDoc.lives_timer_ms = Math.round((userDoc.reset_lives_at - Date.now()) / 1000);
            }
            yield userDoc.save();
            return socket.emit(EVENTS.REFRESH_USER(), { event: EVENTS.REFRESH_USER(), data: userDoc });
        }
    }
});
exports.refresh = refresh;
const takeDailyPrice = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findById(data.data._id);
    if (!user) {
        return;
    }
    if (!user.daily_price) {
        return;
    }
    user.tickets++;
    user.daily_price = false;
    const success = yield user.save();
    if (success) {
        return socket.emit(EVENTS.DAILY_PRICE(), { event: EVENTS.DAILY_PRICE(), data: true });
    }
});
exports.takeDailyPrice = takeDailyPrice;
const activateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    const user = yield User.findOne({ activation_token: token });
    if (!user) {
        return res.render('activation_failed');
    }
    if (user.account_activated) {
        return res.render('allready-activated');
    }
    user.account_activated = true;
    yield user.save();
    sendEmail(null, user, 'activated');
    return res.render('activated');
});
exports.activateUser = activateUser;
function sendEmail(socket, user, html) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kviz.live@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });
    let htmlMessage;
    let htmlMessageRoot;
    let subjectRoot;
    let subject;
    let activated = html === 'activated' ? true : false;
    switch (html) {
        case 'register':
            htmlMessage = `
            <h1>Registracija uspesna</h1>
            <p>Kliknite <a href="https://kvizcina.herokuapp.com/activate/${user.activation_token}">OVDE</a> da aktivirate nalog</p>
        `;
            subject = 'AKTIVACIJA NALOGA';
            htmlMessageRoot = `
            <h1>Registrovan novi nalog</h1>
            <p>User: ${user.name}</p>
            <p>email: ${user.email}</p>
        `;
            subjectRoot = 'NOVA REGISTRACIJA NALOGA';
            break;
        case 'reset_password':
            htmlMessage = `
            <h1>Zahtev za resetovanje lozinke</h1>
            <p>Vas kod za resetovanje lozinke je: ${user.reset_password_token}</p>
             `;
            subject = 'RESETOVANJE LOZINKE';
            break;
        case 'activated':
            htmlMessageRoot = `
            <h1>Nalog aktiviran</h1>
            <p>Korisnik je aktivirao nalog</p>
            <p>User: ${user.name}</p>
            <p>Email: ${user.email}</p>
             `;
            subjectRoot = 'AKTIVACIJA NALOGA';
            break;
    }
    //send message to client
    const mailOptions = {
        from: 'kviz-live@gmail.com',
        to: user.email,
        subject: subject,
        html: htmlMessage
    };
    //notify root for new registration 
    const mailOptionsRoot = {
        from: 'register-kviz.live@gmail.com',
        to: 'kviz.live@gmail.com',
        subject: subjectRoot,
        html: htmlMessageRoot
    };
    //notify root if client activates account 
    const mailOptionsActivated = {
        from: 'activate-kviz.live@gmail.com',
        to: 'kviz.live@gmail.com',
        subject: subjectRoot,
        html: htmlMessageRoot
    };
    if (html === 'register' || html === 'reset_password') {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                if (html === 'register') {
                    return socket.emit(EVENTS.ERROR_CREATING_ACCOUNT(), { event: EVENTS.ERROR_CREATING_ACCOUNT(), data: false });
                }
                else if (html === 'reset_password') {
                    return socket.emit(EVENTS.RESET_PASSWORD_FAILED(), { event: EVENTS.RESET_PASSWORD_FAILED(), data: false });
                }
            }
            else {
                if (html === 'register') {
                    return socket.emit(EVENTS.REGISTER(), { event: EVENTS.REGISTER(), data: true });
                }
                else if (html === 'reset_password') {
                    return socket.emit(EVENTS.RESET_PASSWORD(), { event: EVENTS.RESET_PASSWORD(), data: true });
                }
            }
        });
    }
    if (htmlMessageRoot && html === 'register') {
        transporter.sendMail(mailOptionsRoot, function (error, info) { });
    }
    if (activated) {
        transporter.sendMail(mailOptionsActivated, function (error, info) { });
    }
}
const resetPassword = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.email) {
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null });
    }
    const user = yield User.findOne({ email: data.email });
    if (!user) {
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null });
    }
    const resetToken = (0, exports.randomValue)(5);
    user.reset_password_token = resetToken;
    yield user.save();
    sendEmail(socket, user, 'reset_password');
});
exports.resetPassword = resetPassword;
const resetPasswordConfirmation = (socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.data.email || !data.data.code || !data.data.password || !data.data.repeat) {
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null });
    }
    const user = yield User.findOne({ email: data.data.email });
    if (!user) {
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null });
    }
    if (!user.reset_password_token) {
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null });
    }
    if (user.reset_password_token.toUpperCase() !== data.data.code.toUpperCase()) {
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null });
    }
    const hashedPassword = yield bcrypt.hash(data.data.password, 12);
    if (hashedPassword) {
        user.password = hashedPassword;
        yield user.save();
        return socket.emit(EVENTS.RESET_PASSWORD_CONFIRMATION(), { event: EVENTS.RESET_PASSWORD_CONFIRMATION(), data: null });
    }
    return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null });
});
exports.resetPasswordConfirmation = resetPasswordConfirmation;

import { EmittedData, EmittedLoggedInData, OneOnOneRoom, ShopItem, ShopItemPrice, Socket, UserType } from "../../intrfaces/types";

export { }
const Achievements = require('../../db_models/achievement');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oneOnOneRoom = require('../../db_models/one-on-one');
const EVENTS = require('../socket-events');
const User = require('../../db_models/user');
var nodemailer = require('nodemailer');

export const randomValue = (len: number) => {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
}

export const signUp = async (socket: Socket, data: EmittedData) =>{
    const email = data.email;
    const password = data.password;
    if(!password){
        return;
    }
    const user: UserType = await User.findOne({email: email});
    if(user){
          return socket.emit(EVENTS.EMAIL_ALLREADY_EXIST(), {event: EVENTS.EMAIL_ALLREADY_EXIST(), data: null})
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if(hashedPassword){
        const user = new User({
            email: email,
            password: hashedPassword,
            reset_daily_price: Date.now() + 60 * 60 * 1000,
            roles: ['USER'],
            contributions: [],
            activation_token: randomValue(20),
            questions: []

        });
        user.save();
        sendEmail(socket, user, 'register')
    }
}

export const login = async (socket: Socket, data: EmittedData) => {
    const email = data.email;
    const password = data.password;
    if(!email || !password){
        return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), { event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null });
    }
    const userDoc: UserType = await User.findOne({ email: email });
    if (!userDoc) {
        return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), {event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null});
    }
    if (userDoc && !userDoc.account_activated){
        return socket.emit(EVENTS.ACCOUNT_NOT_ACTIVATED(), { event: EVENTS.ACCOUNT_NOT_ACTIVATED(), data: null });
    }
    if(!userDoc.password){
        return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), { event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null });
    }
    
        bcrypt.compare(password, userDoc.password).then(async (doMatch: boolean) =>{
            if (doMatch) {
                const dataToSign = {
                    email: userDoc.email,
                    _id: userDoc._id,
                    password: userDoc.password,
                    roles: userDoc.roles
                }
                const token = jwt.sign({ user: dataToSign }, process.env.SIGNING_SECRET, { expiresIn: '24h' });
            
                try{
                    const oneOnOne: OneOnOneRoom = await oneOnOneRoom.findOne({ room_id: '1on1'})
                    let users = oneOnOne.users || [];
                    users = users.filter(id => id !== userDoc._id)
                    oneOnOne.users = users;
                    await oneOnOne.save();
                }catch(e){
                    console.log('error in one on one bcrypt')
                }

                
                const data = {
                    data: userDoc,
                    token: token
                }
                return socket.emit(EVENTS.LOGIN(), {event: EVENTS.LOGIN(), data: data.data, token: data.token})

            } else {
                return socket.emit(EVENTS.INCORRECT_LOGIN_DETAILS(), { event: EVENTS.INCORRECT_LOGIN_DETAILS(), data: null });
            }
        });
}

export const autoLogin = async (socket: Socket, data: EmittedLoggedInData) => {

    const email: string = data.data.email;
    const user: UserType = await User.findOne({ email: email });
    if (!user || !user.account_activated) {
        socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED(), data: null })
        return;
    }
    return socket.emit(EVENTS.AUTOLOGIN(), { event: EVENTS.AUTOLOGIN(), data: user })
}

export const facebookLogin = async (req: any, res: any, next: any) => {
    const id: string = req.body.id;
    const name: string = req.body.name;
    const userDoc: UserType = await User.findOne({ fbId: id });
    let token;
    if (userDoc) {
        token = jwt.sign({ user: userDoc }, process.env.SIGNING_SECRET, { expiresIn: '24h' });
            return res.send({
                success: true,
                error: '',
                data: userDoc,
                token
            })
    }else{
        const newUser = new User({
            fbId: id,
            name
        })
        await newUser.save();
        token = jwt.sign({ user: newUser }, process.env.SIGNING_SECRET, { expiresIn: '3h' })
        return res.send({
            success: true,
            error: '',
            data: newUser,
            token
        })
    }
}

export const refresh = async (socket: Socket, data: EmittedLoggedInData) => {
    if (data.data._id) {
        const userDoc = await User.findOne({ _id: data.user_id });
        const achievements = await Achievements.find();
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
            if (userDoc.lives === 0 && userDoc.lives_reset_timer_set && userDoc.reset_lives_at <= Date.now()){
                userDoc.lives = 1;
                userDoc.lives_reset_timer_set = false;
            }
            if(userDoc.reset_lives_at > Date.now()){
                userDoc.lives_timer_ms = Math.round((userDoc.reset_lives_at - Date.now()) / 1000);
            }
            
            await userDoc.save();
            return socket.emit(EVENTS.REFRESH_USER(), {event: EVENTS.REFRESH_USER(), data: userDoc})
        }
    }
}

export const takeDailyPrice = async (socket: Socket, data: EmittedLoggedInData) =>{

    const user = await User.findById(data.data._id);
        if (!user){
            return 
        }
        if (!user.daily_price){
            return ;
        }
   
    user.tickets++;
    user.daily_price = false;
    const success = await user.save();
    if(success){
        return socket.emit(EVENTS.DAILY_PRICE(), {event: EVENTS.DAILY_PRICE(), data: true})
    }
}

export const activateUser = async (req: any, res: any, next: any) =>{
   const token = req.params.token;
   const user = await User.findOne({ activation_token: token });
   if(!user){
       return res.render('activation_failed')
   }
    if (user.account_activated) {
        return res.render('allready-activated')
    }
   user.account_activated = true;
   await user.save();
   sendEmail(null as unknown as Socket, user, 'activated');
   return res.render('activated');
}


function sendEmail(socket: Socket, user: UserType, html: any){
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
    switch(html){
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
             `
            subject = 'RESETOVANJE LOZINKE';
            break;
        case 'activated':
            htmlMessageRoot = `
            <h1>Nalog aktiviran</h1>
            <p>Korisnik je aktivirao nalog</p>
            <p>User: ${user.name}</p>
            <p>Email: ${user.email}</p>
             `
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

    if (html === 'register' || html === 'reset_password'){
        transporter.sendMail(mailOptions, function (error: any, info: any) {
            if (error) {
                if (html === 'register') {
                    return socket.emit(EVENTS.ERROR_CREATING_ACCOUNT(), { event: EVENTS.ERROR_CREATING_ACCOUNT(), data: false })
                } else if (html === 'reset_password') {
                    return socket.emit(EVENTS.RESET_PASSWORD_FAILED(), { event: EVENTS.RESET_PASSWORD_FAILED(), data: false })
                }

            } else {
                if (html === 'register') {
                    return socket.emit(EVENTS.REGISTER(), { event: EVENTS.REGISTER(), data: true })
                } else if (html === 'reset_password') {
                    return socket.emit(EVENTS.RESET_PASSWORD(), { event: EVENTS.RESET_PASSWORD(), data: true })
                }

            }
        });
    }

    if (htmlMessageRoot && html === 'register'){
        transporter.sendMail(mailOptionsRoot, function (error: any, info: any) { });
    }
    if (activated) {
        transporter.sendMail(mailOptionsActivated, function (error: any, info: any) { });
    }
    
}

export const resetPassword = async (socket: Socket, data: EmittedData) => {
    if(!data.email){
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), {event: EVENTS.EMAIL_NOT_EXIST(), data: null})
    }
    const user = await User.findOne({email: data.email});
    if(!user){
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), { event: EVENTS.EMAIL_NOT_EXIST(), data: null })
    }
    const resetToken: string = randomValue(5);
    user.reset_password_token = resetToken;
    await user.save();
    sendEmail(socket, user, 'reset_password');
}

export const resetPasswordConfirmation = async (socket: Socket, data: EmittedLoggedInData) => {
    if(!data.data.email || !data.data.code || !data.data.password || !data.data.repeat){
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), {event:EVENTS.EMAIL_NOT_EXIST(), data: null})
    }
    const user = await User.findOne({email: data.data.email});
    if(!user){
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), {event:EVENTS.EMAIL_NOT_EXIST(),  data: null })
    }
    if (!user.reset_password_token){
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), {event:EVENTS.EMAIL_NOT_EXIST(),  data: null })
    }
    if (user.reset_password_token.toUpperCase() !== data.data.code.toUpperCase()){
        return socket.emit(EVENTS.EMAIL_NOT_EXIST(), {event:EVENTS.EMAIL_NOT_EXIST(),  data: null })
    }

    const hashedPassword = await bcrypt.hash(data.data.password, 12);
    if (hashedPassword) {
        user.password = hashedPassword;
        await user.save();
        return socket.emit(EVENTS.RESET_PASSWORD_CONFIRMATION(), { event: EVENTS.RESET_PASSWORD_CONFIRMATION(), data: null })

    }
    return socket.emit(EVENTS.EMAIL_NOT_EXIST(), {event:EVENTS.EMAIL_NOT_EXIST(),  data: null })

}

import { EmittedLoggedInData, ShopItem, ShopItemPrice, Socket, UserType } from "../../intrfaces/types";

export { }
const User = require('../../db_models/user');
const EVENTS = require ('../socket-events');

const lifeItems = ['LIFE_X_1', 'LIFE_X_2', 'LIFE_X_3'];

function getRandomNumber(quantity: number) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity / 1000);
}

export const getRankingList = async (socket: Socket) =>{
    let users: UserType[] = await User.find();
    const rankedUsers = users.sort((a, b) => a.score - b.score);
    let top100;
    if(rankedUsers.length > 100){
            top100 = rankedUsers.splice(0, 100);
    }else{
            top100 = rankedUsers;
    }
    return socket.emit(EVENTS.GET_RANKING_LIST(), {event: EVENTS.GET_RANKING_LIST(), data: top100}) 
}

export const resetDailyPrice = async (socket: Socket, data: EmittedLoggedInData) => {
    const id = data.data._id;
    const user = await User.findById(id);
    const ticketPrice = [1,1,5,1,,1,1,2,1,,3,1,1,1,2,,1,10,1,1,3,1,,4,1,1,2,1,,4,1,1,1,2,1,1,3,1,1];
    const random = getRandomNumber(ticketPrice.length - 1);
    if (user) {
      const now = Date.now();
      if(now >= user.daily_price){ 
        const oneDay = 24 * 60 * 60 * 1000;
        user.tickets += ticketPrice[random];
        const tomorow = now + oneDay;
        user.daily_price = tomorow;
      }
      await user.save();
      return socket.emit(EVENTS.GET_DAILY_REWARD(), {event: EVENTS.GET_DAILY_REWARD(), data: user, tickets: ticketPrice[random]})
    }else{
      return socket.emit(EVENTS.GET_DAILY_REWARD(), {event: EVENTS.GET_DAILY_REWARD(), data: null, tickets: 0})
    }
}

export const resetPlayingState = async (socket: Socket, data: EmittedLoggedInData) =>{
    const user = await User.findById(data.data._id)
    user.playing = false;
    const saved = await user.save()
    if(saved){
       return socket.emit(EVENTS.RESET_PLAYING_STATE(), {event: EVENTS.RESET_PLAYING_STATE(), data: true})
    }
    return socket.emit(EVENTS.RESET_PLAYING_STATE(), {event: EVENTS.RESET_PLAYING_STATE(), data: false})
}

export const resetLives = async (socket: Socket, data: EmittedLoggedInData) => {
    const user = await User.findById(data.data._id)
    if(user){
        if(user.reset_lives_at > Date.now()){
            user.lives_timer_ms = Math.round((user.reset_lives_at - Date.now()) / 1000);
        }
            await user.save();
           socket.emit(EVENTS.RESET_LIVES(), {event: EVENTS.RESET_LIVES(), data: user})      
    }else{
        socket.emit(EVENTS.RESET_LIVES(), {event: EVENTS.RESET_LIVES(), data: null})  
    }


}


export const updateScore = async (socket: Socket, data: EmittedLoggedInData) =>{
    const score = data.score;
    const user = await User.findById(data.data._id);
    user.score = score;
    user.playing = false;
    const saved = await user.save();
    if(saved){
        return socket.emit(EVENTS.UPDATE_SCORE(), {data: true})
    }
    return socket.emit(EVENTS.UPDATE_SCORE(), {data: false})
}

export const updateSettings = async (socket: Socket, data: EmittedLoggedInData) =>{
    try{
        const name = data.settings.name;
        const border = data.settings.avatar_border || '';
        const avatar = data.settings.image || 'https://firebasestorage.googleapis.com/v0/b/kviz-live.appspot.com/o/1642193033985png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black.png?alt=media';
        console.log(avatar)
        const userDoc = await User.findById(data.data._id);
        if(userDoc){
            userDoc.name = name;
            userDoc.avatar_url = avatar;
            userDoc.avatar_border = border;
            userDoc.save();
            return socket.emit(EVENTS.UPDATE_SETTINGS(), {event: EVENTS.UPDATE_SETTINGS(), success: true, data: userDoc})
        }
        return socket.emit(EVENTS.UPDATE_SETTINGS(), {event: EVENTS.UPDATE_SETTINGS(), success: false, data: null})
    }catch(e){
        console.log(e)
    }

 }

 export const removeNotification = async (socket: Socket, data: EmittedLoggedInData) =>{
    const user = await User.findById(data.data._id);
    if(user){
        user.requestNotification = false;
        await user.save();
        return socket.emit(EVENTS.REMOVE_NOTIFICATION(), {event: EVENTS.REMOVE_NOTIFICATION(), data: user, success: true})
    }
}


export const buyItem = async (socket: Socket, data: EmittedLoggedInData) => {
    const user = await User.findById(data.data._id)
    if (user && data.item as ShopItem) {
        if (user.tickets >= getShopItemCost(data.item)) {
            if (!user.shop_items.includes(data.item) && !lifeItems.includes(data.item)){
                user.avatar_border = data.item;
                const userItems = JSON.parse(JSON.stringify(user.shop_items));
                userItems.push(data.item);
                user.shop_items = userItems;
                user.tickets = user.tickets - getShopItemCost(data.item);
                await user.save();
                socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: data.item, data: user, message: 'Kupljeno' })
            }else{
                socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: data.item, data: user, message: 'Vec kupljeno' })
            }

            if (lifeItems.includes(data.item)){
                const lifes = +data.item.charAt(data.item.length - 1);
                user.lives = user.lives + lifes;
                user.tickets = user.tickets - getShopItemCost(data.item);
                await user.save();
                socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: data.item, data: user, message: 'Kupljeno' })
            }
           
          
        } else {
            socket.emit(EVENTS.BUY_ITEM(), { event: EVENTS.BUY_ITEM(), item: null, data: user, message: 'Nedovoljno tiketa' })
        }

    }
}

export const getShopItemCost = (item: ShopItem): number => {
    switch (item) {
        case ShopItem.ADMIN:
            return ShopItemPrice.ADMIN;
        case ShopItem.NATURE:
            return ShopItemPrice.NATURE;
        case ShopItem.IRON_CROWN:
            return ShopItemPrice.IRON_CROWN;
        case ShopItem.MASTER:
            return ShopItemPrice.MASTER;
        case ShopItem.PORTAL:
            return ShopItemPrice.PORTAL;
        case ShopItem.REGULAR:
            return ShopItemPrice.REGULAR;
        case ShopItem.SLIME:
            return ShopItemPrice.SLIME;
        case ShopItem.LIFE_X_1:
            return ShopItemPrice.LIFE_X_1;
        case ShopItem.LIFE_X_2:
            return ShopItemPrice.LIFE_X_2;
        case ShopItem.LIFE_X_3:
            return ShopItemPrice.LIFE_X_3;
    }
}
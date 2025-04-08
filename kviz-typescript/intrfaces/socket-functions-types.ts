import { EmittedData, EmittedLoggedInData, Socket, SocketIO, UserType } from "./types";

export interface Achievements{
    getAchievements:  (socket: Socket, data: EmittedLoggedInData) => {};
    createAchievements:  (req: any, res: any, next: any) => {};
    
}

export interface Auth{
    randomValue: (len: number) => {};
    signUp: (socket: Socket, data: EmittedData) => {};
    autoLogin:  (socket: Socket, data: EmittedLoggedInData) => {};
    login: (socket: Socket, data: EmittedData) => {};
    facebookLogin: (req: any, res: any, next: any) => {};
    refresh: (socket: Socket, data: EmittedLoggedInData) => {};
    takeDailyPrice: (socket: Socket, data: EmittedLoggedInData) => {};
    activateUser: (req: any, res: any, next: any) => {};
    sendEmail: (socket: Socket, io: any, user: UserType, html: any) => {};
    resetPassword: (socket: Socket, data: EmittedData) => {};
    resetPasswordConfirmation : (socket: Socket, data: EmittedLoggedInData) => {};
    activateEmail : (socket: Socket, data: EmittedLoggedInData) => {};
    
}

export interface FriendRequests{
    inviteFriends: (socket: Socket, data: EmittedLoggedInData) => {};
    addDBFriend : (socket: Socket, io: any, data: EmittedLoggedInData) => {};
    acceptDBFriend : (socket: Socket, data: EmittedLoggedInData) => {};
    searchUsers : (socket: Socket, data: EmittedLoggedInData) => {};
    getFriendRequests : (socket: Socket, data: EmittedLoggedInData) => {};
    getFriendList : (socket: Socket, data: EmittedLoggedInData) => {};
    removeFriend : (socket: Socket, data: EmittedLoggedInData) => {};
}

export interface Questions{
    getRandomNumber: (queantity: number) => {};
    getDBQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    generateRoomQuestions: (roomName: string, amount: number, usersArr: any[]) => {};
    getQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    loadQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    publishQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    unpublishQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    updateQuestionText: (socket: Socket, data: any) => {};
    getAllQuestions: (socket: Socket, data: EmittedLoggedInData) => {};
    addQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    addWordQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    deleteQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    checkQuestion: (socket: Socket, data: EmittedLoggedInData) => 
    {   
        then: (res: any) => {}, 
        catch: (res: any) => {}
    };
    reduceLives: (socket: Socket, data: EmittedLoggedInData) => {};
    resetQuestions: () => {}
}

export interface Rooms{
    randomValue: (len: number) => {};
    createRoom: (socket: Socket, userData: EmittedLoggedInData) => {};
    cleanRooms: () => {};
    createMatchRoom: (room: string, users: any[]) => {};
    createDBRoom: (socket: Socket, room: string, userData: EmittedLoggedInData) => {};
    joinDBRoom: (socket: Socket, userAndRoom: EmittedLoggedInData) => {};
    leaveDBRoom: (socket: Socket, userAndRoom: EmittedLoggedInData) => {};
    getDBRoomResults: (socket: Socket, data: EmittedLoggedInData) => {};
    joinOneOnOneDBRoom: (socket: Socket, data: EmittedLoggedInData) => {};
    joinOneOnOne: (socket: Socket, userAndRoom: EmittedLoggedInData) => {};
}

export interface Tournament{
    getRandomNumber: (quantity: number) => {};
    setIOReady: () => {};
    getQueue: () => {};
    getIO: () => {};
    generateMatchQuestion: (roomName: string, options: any) => {};
    startDBTournament: (socket: Socket, data: EmittedLoggedInData) => {};
    startDBTournamentQuestion: (data: EmittedLoggedInData) => {};
    checkMatchQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    checkDBTournamentQuestion: (socket: Socket, data: EmittedLoggedInData) => {};
    declineOponent: (socket: Socket, data: EmittedLoggedInData) => {};
    acceptDBOponent: (socket: Socket, data: EmittedLoggedInData) => {};
    leaveDBOneOnOne: (socket: Socket, data: EmittedLoggedInData) => {}
}

export interface UserFn{
    getRandomNumber: (quantity: number) => {};
    getRankingList: (socket: Socket) => {};
    resetDailyPrice: (socket: Socket, data: EmittedLoggedInData) => {};
    resetPlayingState: (socket: Socket, data: EmittedLoggedInData) => {};
    resetLives: (socket: Socket, data: EmittedLoggedInData) => {};
    updateScore: (socket: Socket, data: EmittedLoggedInData) => {};
    updateSettings: (socket: Socket, data: EmittedLoggedInData) => {};
    removeNotification: (socket: Socket, data: EmittedLoggedInData) => {};
    buyItem: (socket: Socket, data: EmittedLoggedInData) => {};
}
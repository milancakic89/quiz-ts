import e from "cors";

export interface UserType{
    _id?: any;
    email: string;
    password: string;
    name: string;
    code?: any;
    repeat?: any;
    title?: string;
    score: number;
    lives: number;
    daily_price?: number;
    tickets?: number;
    playing?: boolean;
    roles: string[];
    lives_timer_ms?: number;
    fbId?: number;
    friends: string[],
    friendRequests: string[];
    requestNotification?: boolean;
    notifications?: Notification;
    achievements: Achievement[];
    categories: Category[];
    room?: string;
    online?: boolean;
    account_activated?: boolean;
    socket?: string,
    activation_token?: string;
    is_bot?: boolean;
    reset_password_token?: string;
    lives_reset_timer_set?: boolean;
    reset_lives_at: number;
    contributions?: string[];
    avatar_url?: string;
    questions?: any[];
    allready_answered?: string[],
    shop_items?: any[];
    save: () => {}
}

export interface Question{
    _id?: any;
    question: string;
    correct_letter: string;
    correct_text: string;
    answered_correctly: number;
    question_difficulty: number;
    answered_wrong: number;
    question_picked: number;
    posted_by: string;
    category: string,
    deny_reason: { type: String, required: false },
    hint: string;
    type: QuestionTypes;
    imageUrl: string;
    status: Status,
    answers: any[],
}

export interface Socket{
    id: string;
    rooms: string[];
    join: (str: string) => {};
    leave: (str: string) => {};
    emit: (str: string, data: SocketResponse) => {};
    on: (str: string, data: EmittedData) => {}
}

export interface SocketIO{
    in: any;
    emit: (str: string, data: SocketResponse) => {};
    to: any;
    on: any;
}

interface SocketResponse{
    event?: string;
    [key: string]: any;
}

export interface EmittedData{
    [key: string]: any;
    data?: UserType;
}

export interface OneOnOneRoom{
    room_id: string;
    users: string[];
    save: () => {}
}

export interface EmittedLoggedInData{
    [key: string]: any;
    data: UserType;
    friends?: any;
}

type QuestionTypes = 'REGULAR' | 'PICTURE' | 'WORD';
type Status = 'NA CEKANJU' | 'ODOBRENO' | 'ODBIJENO';

interface Notification{
    achievements: boolean;
    questions: boolean;
    ranking: boolean;
}

interface Achievement{
    category: string;
    answered: number;
    achievement_ticket_ids?: string;
}

interface Category{
    category: string;
    questions_added: number;
}

export enum ShopItem{
    //BORDERS
    ADMIN = 'ADMIN',
    NATURE = 'NATURE',
    IRON_CROWN = 'IRON_CROWN',
    MASTER = 'MASTER',
    PORTAL = 'PORTAL',
    SLIME = 'SLIME',
    REGULAR = 'REGULAR',

    //LIFES
    LIFE_X_1 = 'LIFE_X_1',
    LIFE_X_2 = 'LIFE_X_2',
    LIFE_X_3 = 'LIFE_X_3'
}

export enum ShopItemPrice {
    //BORDERS
    ADMIN = 2000,
    NATURE = 10,
    IRON_CROWN = 10,
    MASTER = 100,
    PORTAL = 50,
    SLIME = 10,
    REGULAR = 0,

    //LIFES
    LIFE_X_1 = 18,
    LIFE_X_2 = 30,
    LIFE_X_3 = 40
}
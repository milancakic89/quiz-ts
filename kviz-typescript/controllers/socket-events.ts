



/**
 * @description join 1on1 created room
 * @common_data_to_send {event: 'JOIN_ONE_ON_ONE'}
 * @returns EVENT STRING
 */
export const JOIN_ONE_ON_ONE = () => 'JOIN_ONE_ON_ONE';

/**
 * @description Emit to client that 1 on 1 is ready
 * @common_data_to_send {event: 'BOTH_ACCEPTEDT'}
 * @returns EVENT STRING
 */
export const BOTH_ACCEPTED = () => 'BOTH_ACCEPTED';

/**
 * @description Save current socket into db for specific later notification
 * @returns EVENT STRING
 */
export const SAVE_SOCKET = () => 'SAVE_SOCKET';


/**
 * @description Emit to client that room dont exist
 * @common_data_to_send {event: 'ROOM_DONT_EXIST'}
 * @returns EVENT STRING
 */
export const ROOM_DONT_EXIST = () => 'ROOM_DONT_EXIST';


/**
 * @description Emited from client to join the room
 * @returns EVENT STRING
 */
export const JOIN_ROOM = () => 'JOIN_ROOM';


/**
 * @description Emit to all room clients that new user has joined room
 * @common_data_to_send {users: room users array, event: 'JOINED_ROOM'}
 * @returns EVENT STRING
 */
export const JOINED_ROOM = () => 'JOINED_ROOM';


/**
 * @description Emited from client to leave the room
 * @returns EVENT STRING
 */
export const LEAVE_ROOM = () => 'LEAVE_ROOM';

/**
 * @description Emited from client to leave the room
 * @returns EVENT STRING
 */
export const LEAVE_MATCH = () => 'LEAVE_MATCH';


/**
 * @description Emit to all room clients that user has leaved room
 * @common_data_to_send {users: room users array, event: 'LEAVED_ROOM'}
 * @returns EVENT STRING
 */
export const LEAVED_ROOM = () => 'LEAVED_ROOM';


/**
 * @description Emmited from client to create a new room
 * @returns EVENT STRING
 */
export const CREATE_ROOM = () => 'CREATE_ROOM';


/**
 * @description Emit to client that room has been created
 * @common_data_to_send {success: boolean, event: 'ROOM_CREATED', roomName: string}
 * @returns EVENT STRING
 */
export const ROOM_CREATED = () => 'ROOM_CREATED';


/**
 * @description Emited from room Admin to start the tournament
 * @common_data_to_send {success: boolean, event: 'TOURNAMENT_STARTING'}
 * @returns EVENT STRING
 */
export const START_TOURNAMENT = () => 'START_TOURNAMENT';


/**
 * @description Emit to tournament users to start the tournament
 *  @common_data_to_send {success: boolean}
 * @returns EVENT STRING
 */
export const TOURNAMENT_STARTING = () => 'TOURNAMENT_STARTING';


/**
 * @description Emited from user regarding selected answer on given question
 * @common_data_to_send {success: boolean, event: 'QUESTION_ANSWERED'}
 * @returns EVENT STRING
 */
export const QUESTION_ANSWERED = () => 'QUESTION_ANSWERED';


/**
 * @description Emited from user that he is in waiting room
 * @common_data_to_send {success: boolean, users: room users array, event: 'WAITING_OTHERS_TO_ANSWER'}
 * @returns EVENT STRING
 */
export const WAITING_OTHERS_TO_ANSWER = () => 'WAITING_OTHERS_TO_ANSWER';


/**
 * @description Emited to all users that new question is starting
 * @common_data_to_send {success: boolean, users: room users array, event: 'START_NEXT_TOURNAMENT_QUESTION'}
 * @returns EVENT STRING
 */
export const START_TOURNAMENT_QUESTION = () => 'START_TOURNAMENT_QUESTION';


/**
 * @description Emited to all users that tournament is finished
 * @common_data_to_send {success: boolean, users: room users array, event: 'TOURNAMENT_FINISHED'}
 * @returns EVENT STRING
 */
export const TOURNAMENT_FINISHED = () => 'TOURNAMENT_FINISHED';


/**
 * @description Emited from client, contains slected question letter
 * @common_data_to_send {correct: boolean, users: room users array, event: 'SELECTED_QUESTION_LETTER'}
 * @returns EVENT STRING
 */
export const SELECTED_QUESTION_LETTER = () => 'SELECTED_QUESTION_LETTER';

/**
 * @description Emit to room when someone answers question to update waiting status
 * @common_data_to_send {users: room users array, event: 'UPDATE_WAITING_STATUS'}
 * @returns EVENT STRING
 */
 export const UPDATE_WAITING_STATUS = () => 'UPDATE_WAITING_STATUS';


 /**
 * @description Emit to room when everyone has answered the question
 * @common_data_to_send {users: room users array, event: 'EVERYONE_ANSWERED'}
 * @returns EVENT STRING
 */
  export const EVERYONE_ANSWERED = () => 'EVERYONE_ANSWERED';

   /**
 * @description Emit to client room question
 * @common_data_to_send {users: room users array, event: 'EVERYONE_ANSWERED'}
 * @returns EVENT STRING
 */
    export const GET_ROOM_QUESTION = () => 'GET_ROOM_QUESTION';


/**
* @description Emit to client room results
* @common_data_to_send {users: room users array, event: 'GET_ROOM_RESULTS'}
* @returns EVENT STRING
*/
 export const GET_ROOM_RESULTS = () => 'GET_ROOM_RESULTS';


/**
* @description cleaning the rooms
* @common_data_to_send {'CLEAN_THE_EMPTY_ROOMS'}
* @returns EVENT STRING
*/
export const CLEAN_THE_EMPTY_ROOMS = () => 'CLEAN_THE_EMPTY_ROOMS';


/**
* @description Receives an id of a user to send friend request to
* @common_data_to_send {event: 'ADD_FRIEND', success: boolean}
* @returns EVENT STRING
*/
export const ADD_FRIEND = () => 'ADD_FRIEND';


/**
* @description Inform the user that request has been sent allready
* @common_data_to_send {event: 'FRIEND_ALLREADY_REQUESTED'}
* @returns EVENT STRING
*/
export const FRIEND_ALLREADY_REQUESTED = () => 'FRIEND_ALLREADY_REQUESTED';


/**
* @description Emit to client about failed friend acceptance
* @common_data_to_send {event: 'ADD_FRIEND_FAILED'}
* @returns EVENT STRING
*/
export const ADD_FRIEND_FAILED = () => 'ADD_FRIEND_FAILED';

/**
* @description Accepts friend request
* @common_data_to_send {event: 'ACCEPT_FRIEND', success: boolean}
* @returns EVENT STRING
*/
export const ACCEPT_FRIEND = () => 'ACCEPT_FRIEND';


/**
* @description Mark the user offline on user logout
* @common_data_to_send {event: 'USER_DISCONECTED', user_id: string}
* @returns EVENT STRING
*/
export const DISCONNECT_USER = () => 'DISCONNECT_USER';

/**
* @description Mark the user online
* @common_data_to_send {event: 'USER_CONNECTED', user_id: string}
* @returns EVENT STRING
*/
export const USER_CONNECTED = () => 'USER_CONNECTED';


/**
* @description Mark the user offline
* @common_data_to_send {event: 'USER_DISCONECTED', user_id: string}
* @returns EVENT STRING
*/
export const USER_DISCONECTED = () => 'USER_DISCONECTED';

/**
* @description Emit this event to roomName
* @common_data_to_send {event: 'TOURNAMENT_INVITATION', roomName: string}
* @returns EVENT STRING
*/
export const INVITE_FRIENDS = () => 'INVITE_FRIENDS';


/**
* @description Emit this event to roomName
* @common_data_to_send {event: 'TOURNAMENT_INVITATION', roomName: string}
* @returns EVENT STRING
*/
export const TOURNAMENT_INVITATION = () => 'TOURNAMENT_INVITATION';


/**
* @description Emit tournament room to 2 users that are in room
* @common_data_to_send {event: 'OPONENT_FOUND', roomName: string, oponent: User}
* @returns EVENT STRING
*/
export const OPONENT_FOUND = () => 'OPONENT_FOUND';


/**
* @description Leaves 1on1 room
* @common_data_to_send {event: 'LEAVE_ONE_ON_ONE'}
* @returns EVENT STRING
*/
export const LEAVE_ONE_ON_ONE = () => 'LEAVE_ONE_ON_ONE';

/**
* @description Decline 1on1 oponent
* @common_data_to_send {event: 'OPONENT_DECLINED'}
* @returns EVENT STRING
*/
export const OPONENT_DECLINED = () => 'OPONENT_DECLINED';


/**
* @description Oponent acepted
* @common_data_to_send {event: 'OPONENT_ACCEPTED'}
* @returns EVENT STRING
*/
export const OPONENT_ACCEPTED = () => 'OPONENT_ACCEPTED';

/**
* @description I accepted oponent
* @common_data_to_send {event: 'OPONENT_ACCEPTED'}
* @returns EVENT STRING
*/
export const I_ACCEPTED = () => 'I_ACCEPTED';

/**
* @description emits number of online users
* @common_data_to_send {event: 'ONLINE_USERS_COUNT', online: number}
* @returns EVENT STRING
*/
export const ONLINE_USERS_COUNT = () => 'ONLINE_USERS_COUNT';

/**
* @description refresh user
* @common_data_to_send {event: 'REFRESH_USER', data: user}
* @returns EVENT STRING
*/
export const REFRESH_USER = () => 'REFRESH_USER';

/**
* @description Atempts autologin with token
* @common_data_to_send {event: 'AUTOLOGIN', data: user}
* @returns EVENT STRING
*/
export const AUTOLOGIN = () => 'AUTOLOGIN';


/**
* @description As soon as connection is established notify user to emit autologin
* @common_data_to_send {event: 'AUTOLOGIN_AVAILABLE'}
* @returns EVENT STRING
*/
export const AUTOLOGIN_AVAILABLE = () => 'AUTOLOGIN_AVAILABLE';


/**
* @description Emits incorect login details
* @common_data_to_send {event: 'INCORRECT_LOGIN_DETAILS', data: null}
* @returns EVENT STRING
*/
export const INCORRECT_LOGIN_DETAILS = () => 'INCORRECT_LOGIN_DETAILS';

/**
* @description Emits incorect login details
* @common_data_to_send {event: 'EMAIL_ALLREADY_EXIST', data: null}
* @returns EVENT STRING
*/
export const EMAIL_ALLREADY_EXIST = () => 'EMAIL_ALLREADY_EXIST';


/**
* @description Emits new friend request found
* @common_data_to_send {event: 'NEW_FRIEND_REQUEST', data: null}
* @returns EVENT STRING
*/
export const NEW_FRIEND_REQUEST = () => 'NEW_FRIEND_REQUEST';

/**
* @description Emits account not yet activated
* @common_data_to_send {event: 'ACCOUNT_NOT_ACTIVATED', data: null}
* @returns EVENT STRING
*/
export const ACCOUNT_NOT_ACTIVATED = () => 'ACCOUNT_NOT_ACTIVATED';


/**
* @description Emits account activated true or false
* @common_data_to_send {event: 'ACCOUNT_ACTIVATED', data: null}
* @returns EVENT STRING
*/
export const ACCOUNT_ACTIVATED = () => 'ACCOUNT_ACTIVATED';

/**
* @description Emits register requests
* @common_data_to_send {event: 'REGISTER', data: boolean}
* @returns EVENT STRING
*/
export const REGISTER = () => 'REGISTER';

/**
* @description Emits error on account creation
* @common_data_to_send {event: 'ERROR_CREATING_ACCOUNT', data: null}
* @returns EVENT STRING
*/
export const ERROR_CREATING_ACCOUNT = () => 'ERROR_CREATING_ACCOUNT';

/**
* @description Emits failed autologin
* @common_data_to_send {event: 'AUTOLOGINFAILED', data: null}
* @returns EVENT STRING
*/
export const AUTOLOGINFAILED = () => 'AUTOLOGINFAILED';

/**
* @description Emits users list
* @common_data_to_send {event: 'GET_ALL_USERS', data: User[]}
* @returns EVENT STRING
*/
export const GET_ALL_USERS = () => 'GET_ALL_USERS';

/**
* @description Emits friend list
* @common_data_to_send {event: 'GET_FRIEND_LIST', data: User[]}
* @returns EVENT STRING
*/
export const GET_FRIEND_LIST = () => 'GET_FRIEND_LIST';


/**
* @description Emits friend requests
* @common_data_to_send {event: 'GET_FRIEND_REQUESTS', data: User[]}
* @returns EVENT STRING
*/
export const GET_FRIEND_REQUESTS = () => 'GET_FRIEND_REQUESTS';


/**
* @description Emits friend list
* @common_data_to_send {event: 'REMOVE_FRIEND', data: User[]}
* @returns EVENT STRING
*/
export const REMOVE_FRIEND = () => 'REMOVE_FRIEND';


/**
* @description Emited from client with login data
* @returns EVENT STRING
*/
export const LOGIN = () => 'LOGIN';


/**
* @description Emited to client with login status success
* @common_data_to_send {event: 'LOGIN_SUCCESSFUL', data: User, message: string}
* @returns EVENT STRING
*/
export const LOGIN_SUCCESSFUL = () => 'LOGIN_SUCCESSFUL';

/**
* @description Emited to client with login status failed
* @common_data_to_send {event: 'LOGIN_FAILED', data: null, message: string}
* @returns EVENT STRING
*/
export const LOGIN_FAILED = () => 'LOGIN_FAILED';

/**
* @description Emited to client that daily price is received
* @common_data_to_send {event: 'DAILY_PRICE', data: boolean, message: string}
* @returns EVENT STRING
*/
export const DAILY_PRICE = () => 'DAILY_PRICE';

/**
* @description Emit achievements to client 
* @common_data_to_send {event: 'GET_ACHIEVEMENTS', data: achievemens[]}
* @returns EVENT STRING
*/
export const GET_ACHIEVEMENTS = () => 'GET_ACHIEVEMENTS';

/**
* @description Emit question to client with modification that game requires
* @common_data_to_send {event: 'GET_QUESTION', data: questions}
* @returns EVENT STRING
*/
export const GET_QUESTION = () => 'GET_QUESTION';

/**
* @description Emit question to client without any modification
* @common_data_to_send {event: 'LOAD_SINGLE_QUESTION', data: questions}
* @returns EVENT STRING
*/
export const LOAD_SINGLE_QUESTION = () => 'LOAD_SINGLE_QUESTION';

/**
* @description Emit questions to client 
* @common_data_to_send {event: 'GET_QUESTIONS', data: questions[]}
* @returns EVENT STRING
*/
export const GET_QUESTIONS = () => 'GET_QUESTIONS';

/**
* @description Add new question
* @common_data_to_send {event: 'ADD_QUESTION', data: boolean}
* @returns EVENT STRING
*/
export const ADD_QUESTION = () => 'ADD_QUESTION';

/**
* @description Add new word question
* @common_data_to_send {event: 'ADD_WORD_QUESTION', data: null}
* @returns EVENT STRING
*/
export const ADD_WORD_QUESTION = () => 'ADD_WORD_QUESTION';



/**
* @description Add new question
* @common_data_to_send {event: 'ADD_IMAGE_QUESTION', data: boolean}
* @returns EVENT STRING
*/
export const ADD_IMAGE_QUESTION = () => 'ADD_IMAGE_QUESTION';

/**
* @description emit deleted question
* @common_data_to_send {event: 'DELETE_QUESTION', data: boolean}
* @returns EVENT STRING
*/
export const DELETE_QUESTION = () => 'DELETE_QUESTION';


/**
* @description emit deleted question
* @common_data_to_send {event: 'CHECK_QUESTION', data: boolean}
* @returns EVENT STRING
*/
export const CHECK_QUESTION = () => 'CHECK_QUESTION';

/**
* @description emit deleted question
* @common_data_to_send {event: 'CHECK_QUESTION', data: boolean}
* @returns EVENT STRING
*/
export const CHECK_PRACTICE_QUESTION = () => 'CHECK_PRACTICE_QUESTION';


/**
* @description Emit that question is published
* @common_data_to_send {event: 'PUBLISH_QUESTION', data: boolean}
* @returns EVENT STRING
*/
export const PUBLISH_QUESTION = () => 'PUBLISH_QUESTION';

/**
* @description Emit that question is unpublished
* @common_data_to_send {event: 'UNPUBLISH_QUESTION', data: boolean}
* @returns EVENT STRING
*/
export const UNPUBLISH_QUESTION = () => 'UNPUBLISH_QUESTION';

/**
* @description Emit that question is updated
* @common_data_to_send {event: 'UPDATE_QUESTION_TEXT', data: boolean}
* @returns EVENT STRING
*/
export const UPDATE_QUESTION_TEXT = () => 'UPDATE_QUESTION_TEXT';


/**
* @description Emit that 1on1 match is found
* @common_data_to_send {event: 'MATCH_FOUND', data: {me: user, oponent: user}}
* @returns EVENT STRING
*/
export const MATCH_FOUND = () => 'MATCH_FOUND';

/**
* @description Emit top 100 users with highest score
* @common_data_to_send {event: 'GET_RANKING_LIST', data: User[]}
* @returns EVENT STRING
*/
export const GET_RANKING_LIST = () => 'GET_RANKING_LIST';


/**
* @description Emit that daily reward is picked
* @common_data_to_send {event: 'GET_DAILY_REWARD', data: boolean}
* @returns EVENT STRING
*/
export const GET_DAILY_REWARD = () => 'GET_DAILY_REWARD';


/**
* @description Emit reseted playing state
* @common_data_to_send {event: 'RESET_PLAYING_STATE', data: boolean}
* @returns EVENT STRING
*/
export const RESET_PLAYING_STATE = () => 'RESET_PLAYING_STATE';


/**
* @description Emit reseted lives
* @common_data_to_send {event: 'RESET_LIVES', data: User}
* @returns EVENT STRING
*/
export const RESET_LIVES = () => 'RESET_LIVES';


/**
* @description Emit updated score
* @common_data_to_send {event: 'UPDATE_SCORE', data: User}
* @returns EVENT STRING
*/
export const UPDATE_SCORE = () => 'UPDATE_SCORE';

/**
* @description Emit updated settings
* @common_data_to_send {event: 'UPDATE_SETTINGS', data: User}
* @returns EVENT STRING
*/
export const UPDATE_SETTINGS = () => 'UPDATE_SETTINGS';

/**
* @description Emit removed notification
* @common_data_to_send {event: 'REMOVE_NOTIFICATION', data: user, success: boolean}
* @returns EVENT STRING
*/
export const REMOVE_NOTIFICATION = () => 'REMOVE_NOTIFICATION';


/**
* @description Emit reduced life
* @common_data_to_send {event: 'REDUCE_LIVES', data: user, success: boolean}
* @returns EVENT STRING
*/
export const REDUCE_LIVES = () => 'REDUCE_LIVES';


/**
* @description For debugging purposes only
* @common_data_to_send {event: 'TRACK_ONE_ON_ONE', data: oneOneOneRoom.oneonOneusers}
* @returns EVENT STRING
*/
export const TRACK_ONE_ON_ONE = () => 'TRACK_ONE_ON_ONE';


/**
* @description For debugging purposes only
* @common_data_to_send {event: 'TRACK_ONE_ON_ONE', data: oneOneOneRoom.oneonOneusers}
* @returns EVENT STRING
*/
export const TRACK_QUEUE_MANAGER = () => 'TRACK_QUEUE_MANAGER';


/**
* @description If data pulling error occurs, emit to socket
* @common_data_to_send {event: 'DATABASE_CONNECTION_ERROR', data: null}
* @returns EVENT STRING
*/
export const DATABASE_CONNECTION_ERROR = () => 'DATABASE_CONNECTION_ERROR';



/**
* @description emit password reseted request 
* @common_data_to_send {event: 'RESET_PASSWORD', data: null}
* @returns EVENT STRING
*/
export const RESET_PASSWORD = () => 'RESET_PASSWORD';

/**
* @description emit password reseted request failed
* @common_data_to_send {event: 'RESET_PASSWORD_FAILED', data: null}
* @returns EVENT STRING
*/
export const RESET_PASSWORD_FAILED = () => 'RESET_PASSWORD_FAILED';

/**
* @description emit confirmation on reset password
* @common_data_to_send {event: 'RESET_PASSWORD_CONFIRMATION', data: null}
* @returns EVENT STRING
*/
export const RESET_PASSWORD_CONFIRMATION = () => 'RESET_PASSWORD_CONFIRMATION';

/**
* @description emit account not found
* @common_data_to_send {event: 'EMAIL_NOT_EXIST', data: null}
* @returns EVENT STRING
*/
export const EMAIL_NOT_EXIST = () => 'EMAIL_NOT_EXIST';



/**
 * @description join 1on1 created room
 * @common_data_to_send {event: 'JOIN_ONE_ON_ONE'}
 * @returns EVENT STRING
 */
export const BUY_ITEM = () => 'BUY_ITEM'; 
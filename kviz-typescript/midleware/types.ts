import { EmittedData, EmittedLoggedInData, Socket } from "../intrfaces/types";

export interface Middleware{
    socketMiddleware: (socket: Socket, data: EmittedData, fn: any) => {}
}

export type Fn = (socket: Socket, data: EmittedLoggedInData) => {};
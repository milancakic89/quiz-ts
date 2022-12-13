import { EmittedLoggedInData, Socket, SocketIO } from "../intrfaces/types"

const ErrorDB = require('../db_models/errors')

export const handleError = (fn: any) =>{
    return (req: any,res: any, next: any) => {
        try{
            fn(req, res, next)
        }catch(error){
            const err = new ErrorDB({
                message: String(error),
                caused_by: fn.name
            })
            err.save();
        }
    }
}

export const handleSocketError = (fn: any, socket: Socket, data: any) => {
    fn(socket, data)
    .catch((error: any) => console.log(error))
}

export const handleIOError = (fn: any, io: SocketIO, socket: Socket, data: any) => {
    fn(io, socket, data)
    .catch((error: any) => console.log(error))
}
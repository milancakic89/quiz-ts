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
exports.init = exports.getDBQueue = exports.DBQueue = void 0;
let DBQueueRef;
class DBQueue {
    constructor() {
        this._queueList = [];
        this._disabled = false;
        this.inited = true;
        this.counter = 0;
    }
    addToQueue(obj) {
        this._queueList.push(obj);
        this.checkNewestQueue();
        return obj;
    }
    checkNewestQueue() {
        if (!this._disabled && this._queueList.length) {
            this._disabled = true;
            this.startSaving();
        }
        else {
            console.log('');
        }
    }
    startSaving() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._queueList.length && this._disabled) {
                this._disabled = false;
                return setTimeout(() => this.checkNewestQueue(), 500);
            }
            const { success, error } = yield this.saveQueue(this._queueList[this.counter]);
            if (success) {
                this.counter++;
                setTimeout(() => {
                    this.startSaving();
                }, 20);
            }
        });
    }
    saveQueue(obj) {
        return new Promise((resolve, reject) => {
            if (obj && obj.save && typeof obj.save === 'function') {
                obj.save()
                    .then((res) => {
                    return resolve({
                        success: true,
                        error: null
                    });
                })
                    .catch((err) => {
                    return reject({
                        success: false,
                        error: err
                    });
                });
            }
        });
    }
}
exports.DBQueue = DBQueue;
const getDBQueue = () => {
    if (DBQueueRef && DBQueueRef.inited) {
        return DBQueueRef;
    }
    else {
        DBQueueRef = new DBQueue();
        return DBQueueRef;
    }
};
exports.getDBQueue = getDBQueue;
const init = () => {
    DBQueueRef = new DBQueue();
};
exports.init = init;

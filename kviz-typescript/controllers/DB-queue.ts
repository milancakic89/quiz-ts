interface DBQueueRef{
    addToQueue: () => {},
    startSaving: () => {},
    inited: boolean;
}

let DBQueueRef: any;

export class DBQueue{
    _queueList: any[] = [];
    _disabled = false;
    inited = true;
    counter = 0;

    addToQueue(obj: any){
        this._queueList.push(obj);
        this.checkNewestQueue();
        return obj;
    }

    checkNewestQueue(){
        if (!this._disabled && this._queueList.length) {
            this._disabled = true;
            this.startSaving();
        }else{
            console.log('')
        }
    }

    async startSaving(){
        if (!this._queueList.length && this._disabled) {
            this._disabled = false;
            return setTimeout(() => this.checkNewestQueue(), 500);
               
        }
        const {success, error } = await this.saveQueue(this._queueList[this.counter]);
        if (success){
            this.counter++;
            setTimeout(()=> {
                this.startSaving();
            }, 20)
        }
    }

    saveQueue(obj: any){
        return new Promise<{success: boolean, error: any}>((resolve, reject) =>{
            if (obj && obj.save && typeof obj.save === 'function'){
                obj.save()
                .then((res: any) =>{
                    return resolve({
                        success: true,
                        error: null
                    })
                })
                .catch((err: any) =>{
                    return reject({
                        success: false,
                        error: err
                    })
                })
            }
        })
    }
}

export const getDBQueue = () => {
    if (DBQueueRef && DBQueueRef.inited){
        return DBQueueRef;
    }else{
        DBQueueRef = new DBQueue();
        return DBQueueRef;
    }
}

export const init = () =>{
    DBQueueRef = new DBQueue();
}


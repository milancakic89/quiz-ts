const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const url = 'mongodb+srv://milancakic:Masterdamus12@quiz-cluster.vopbe.mongodb.net/myFirstDatabase?retryWrites=true'

const mongoConnect = (callback: any) =>{
    MongoClient.connect(url).then((result: any) => {
        callback(result)
    }).catch((error: any) =>{
        callback(null)
    });
}

module.exports = mongoConnect;
var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var userSchema=new Schema({
    "userName":{type: String,
    unique:true},
    "password": String,
    "email": String,
    "loginHistory":[{
        "dateTime": Date,
        "userAgent": String
    }]
});
let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MongoDB);

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};


module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2){
            reject("Passwords do not match");
        }

        bcrypt.hash(userData.password, 10).then(hash => {
            userData.password = hash;
            userData.userName = userData.userName?.toLowerCase();
            let newUser = new User(userData);

            newUser.save((err) => {
                if(err) {
                    if(err.code == 11000 ){
                      reject("User Name already taken!")
                    } else{
                    console.log(err);
                    reject("Error creating new user:" + err)}
                  } else {
                    console.log(newUser);
                    resolve(userData);
                  }
            });
        }).catch(err =>{
            reject("There was an error encrypting the password");
        });

    });
}


module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName?.toLowerCase() })
            .exec()
            .then(users => {
                bcrypt.compare(userData.password, users[0].password).then((result) => {
                    if (result === true) {
                        users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                        User.updateOne(
                            { userName: users[0].userName },
                            { $set: { loginHistory: users[0].loginHistory } },
                            { multi: false }
                        ).exec()
                        .then(() => { resolve(users[0]) })
                        .catch(err => { reject("There was an error verifying the user: " + err) })
                    }
                    else {
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                })
            })
            .catch(() => {
                reject("Unable to find user: " + userData.userName);
            })
    })
};
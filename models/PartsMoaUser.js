import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type:String,
        required: "UserName is required"
    },
    email:{
        type:String,
        required: "User Email is required"
    },
    password:{
        type:String,
        required: "User Password is required"
    },
    carid:{
        type: String,
        required: "User CarId is required"
    },
    carinfo:{
        type: String,
        required: "User CarInfo is required"
    },
    imgprofile:{
        type: String
    } ,
    imgCar :{
        type: String
    },
    isSetProfile: {
        type: Boolean
    },
    isSetCar: {
        type: Boolean
    }
    ,
    resistedAt:{
        type:Date,
        default: Date.now
    },
});

module.exports = mongoose.model('PartsMoaUser', UserSchema);

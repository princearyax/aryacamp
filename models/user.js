const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});
userSchema.plugin(passportLocalMongoose); //add on to schema a username(unique) and password

module.exports = mongoose.model("User", userSchema);


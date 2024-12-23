// const mongoose = require('mongoose')

// const userSchema = new mongoose.Schema({
//     firstname: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         minlength: 3,
//         maxlength: 20,
//     },
//     lastname:{
//         type: String,
//         required: true,
//         trim: true,
//         minlength: 1,
//         maxlength: 20,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 6,
//     }
// })

// const User = mongoose.model('User', userSchema);
// module.exports = User;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {type:String},
  firstname: {type:String,require:true},
  lastname:{type: String,required:true},
  email: {type:String,reuired:true,unique:true},
  phone:{type:String, minlength: 10},
  password:{type:String},
  status: { type: Boolean, default: true },
  usedCoupons:[{type: mongoose.Schema.Types.ObjectId, ref: 'Offer'}]
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);

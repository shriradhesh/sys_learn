
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const contactUs_frSchema = new Schema({
  
    userName : {
    type : String,
    required : true,
    },

    user_Email : {
    type : String ,
    required : true,
    trim: true,
    lowercase: true,    
  
    },

    user_phone: {
    type : Number ,
    required : true
    },

    message : {
        type : String ,
        required : true
    },
    Company : {
        type : String ,
        required : true
    },
    Subject : {
        type : String ,
        required : true
    }
      
      
} , { timestamps: true } )
const contactUs_fr = mongoose.model('contactUs_fr', contactUs_frSchema)

module.exports = contactUs_fr
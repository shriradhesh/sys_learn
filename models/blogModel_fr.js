const mongoose = require('mongoose');
const { Schema } = mongoose;
const blogSchema_fr = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Admin",
},
    adminName : {
            type : String
    }, 
    admin_email : 
    {
        type : String
    } ,
    
    blog_Heading_fr : {
          type : String ,
          required : true
    },
     blog_Desciption_fr : {
        type: String,
        required : true
    } ,  
   blogImage_fr : {
    type : String
   },
    
   blog_status_fr: {
    type: Number,
    enum: [0,1],    
    default :  1      // 0 for active , 1 for inactive

  },

} ,  {timestamps: true});

const blogModel_fr = mongoose.model('blogModel_fr', blogSchema_fr);

module.exports = blogModel_fr;

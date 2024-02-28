const mongoose = require('mongoose');
const { Schema } = mongoose;
const blogSchema = new Schema({
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
    
    blog_Heading : {
          type : String ,
          required : true
    },
     blog_Desciption : {
        type: String,
        required : true
    } ,  
   blogImage : {
    type : String
   },
    
   blog_status: {
    type: Number,
    enum: [0,1],    
    default :1       // 0 for active , 1 for inactive

  },

} ,  {timestamps: true});

const blogModel = mongoose.model('blogModel', blogSchema);

module.exports = blogModel;

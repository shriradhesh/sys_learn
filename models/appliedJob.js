const mongoose = require('mongoose');

const appliedJobSchema = mongoose.Schema({
    
    
    userName : {
        type : String
    },
    user_Email : {
        type : String
    },
    phone_no : {
        type : String
    },
    job_Heading : {
        type : String
    },
    jobId : {        
            type: mongoose.Schema.Types.ObjectId,
            ref: 'jobModel'      
        },      
    
    Salary : {
        type: String,
        required : true
    } ,
    uploadResume : {
            type : String
    },
    job_expired_Date : 
    {
        type : String
    },
    job_status: {
        type: Number,
        enum: [0,1],    
        default :0      // 0 for active , 1 for inactive

      },
     
    
} ,  {timestamps: true});

const appliedjobModel = mongoose.model('appliedjobModel', appliedJobSchema);

module.exports = appliedjobModel;

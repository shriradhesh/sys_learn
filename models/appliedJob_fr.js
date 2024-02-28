const mongoose = require('mongoose');

const appliedJob_fr_Schema = mongoose.Schema({
    
    
    userName : {
        type : String
    },
    user_Email : {
        type : String
    },
    phone_no : {
        type : String
    },
    job_Heading_fr : {
        type : String
    },
    jobId_fr: {        
            type: mongoose.Schema.Types.ObjectId,
            ref: 'jobModel_fr'      
        },      
    
    Salary_fr : {
        type: String,
        required : true
    } ,
    uploadResume : {
            type : String
    },
    job_expired_Date_fr : 
    {
        type : String
    },
    job_status_fr: {
        type: Number,
        enum: [0,1],    
        default :1      // 0 for active , 1 for inactive

      },
     
    
} ,  {timestamps: true});

const appliedjob_fr_Model = mongoose.model('appliedjob_fr_Model', appliedJob_fr_Schema);

module.exports = appliedjob_fr_Model;

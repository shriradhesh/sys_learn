const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Admin",
    },
    adminName: {
        type: String,
    },
    admin_email: {
        type: String,
       // required: true,
      //  unique: true, // Assuming admin email should be unique
       // lowercase: true,
       // trim: true,
       // match: /^\S+@\S+\.\S+$/, // Simple email format validation
    },
    job_Heading: {
        type: String,
        required: true,
    },
    job_Description: {
        type: String,
        required: true,
    },
    company_Address: {
        type: String,
        required: true,
    },
    Salary: {
        type: String,
        required: true,
    },
    job_expired_Date: {
        type: Date,
    },
    job_status: {
        type: Number,
        enum: [0, 1],
        default: 1, 
    },
    JobImage : {
        type : String
       },
    Job_Experience : 
    {
        type : String
    }
}, { timestamps: true });

const jobModel = mongoose.model('jobModel', jobSchema);

module.exports = jobModel;

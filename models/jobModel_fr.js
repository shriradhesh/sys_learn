const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema_fr = new Schema({
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
        // unique: true, // Assuming admin email should be unique
        // lowercase: true,
        // trim: true,
        // match: /^\S+@\S+\.\S+$/, // Simple email format validation
    },
    job_Heading_fr: {
        type: String,
        required: true,
    },
    job_Description_fr: {
        type: String,
        required: true,
    },
    company_Address_fr: {
        type: String,
        required: true,
    },
    Salary_fr: {
        type: String,
        required: true,
    },
    job_expired_Date_fr: {
        type: Date,
    },
    job_status_fr: {
        type: Number,
        enum: [0, 1],
        default: 0, // 0 for active, 1 for inactive
    },
    JobImage_fr: {
        type: String
    },
    Job_Experience_fr: {
        type: String
    }
}, { timestamps: true });

const jobModel_fr = mongoose.model('jobModel_fr', jobSchema_fr);

module.exports = jobModel_fr;

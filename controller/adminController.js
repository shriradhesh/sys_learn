const cors = require('cors')
const fs = require('fs')
const bcrypt = require('bcrypt')
const Admin = require('../models/AdminModel')
const jobModel = require('../models/jobModel')
const upload = require('../utils/uploads')
const multer = require('multer')
const sendEmails = require('../utils/AdminSendEmail')
const otpModel = require('../models/otpModel')
const blogModel = require('../models/blogModel')
const appliedjobModel = require('../models/appliedJob')
const contactUs = require('../models/contuct_us')
const jobModel_fr = require('../models/jobModel_fr')
const appliedjob_fr_Model = require('../models/appliedJob_fr')
const blogModel_fr = require('../models/blogModel_fr')
const contactUs_fr = require('../models/contact_us_fr')


                                              /* Admin  */
// API for login ADMIN 

const login_Admin = async (req, res) => {
    try {
        const { email, password } = req.body;

            if(!email)
            {
                return res.status(400).json({
                              success : false ,
                              emailExistanceMessage : 'email Required'
                })
            }
            if(!password)
            {
                return res.status(400).json({
                              success : false ,
                              passwordExistanceMessage : 'password Required'
                })
            }

        // Find Admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ EmailMessage: 'Email incorrect', success: false });
        }

        // Check if the stored password is in plain text
        if (admin.password && admin.password.startsWith('$2b$')) {
            // Password is already bcrypt hashed
            const passwordMatch = await bcrypt.compare(password, admin.password);

            if (!passwordMatch) {
                return res.status(401).json({ passwordMessage: 'Password incorrect', success: false });
            }
        } else {
            // Convert plain text password to bcrypt hash
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Update the stored password in the database
            admin.password = hashedPassword;
            await admin.save();
        }

        return res.json({ message: 'Admin Login Successful', success: true, data: admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: ' server error', success: false , error_message : error.message });
    }
};

// APi for change Admin password
                         
                     const changeAdminPassword = async (req,res)=>{
                        try {
                            const id = req.params.id
                            const {oldPassword , newPassword , confirmPassword} = req.body
                           
                            if(!oldPassword)
                            {
                              return res.status(400).json({
                                                 success : false ,
                                                 oldPasswordMessage : 'old password required'
                              })
                            }
                            if(!newPassword)
                            {
                              return res.status(400).json({
                                                 success : false ,
                                                 NewPasswordMessage : 'newPassword required'
                              })
                            }
                            if(!confirmPassword)
                            {
                              return res.status(400).json({
                                                 success : false ,
                                                 confirmPasswordMessage : 'confirmPassword required'
                              })
                            }
                           
                                   // check if new Password is matched with confirm password
                                if(newPassword !== confirmPassword)
                                {
                                    return res.status(400).json({
                                                         success : false ,
                                                         passwordMatchMessage  : 'password not matched'
                                    })
                                }  
                            
                                // check for admin
                                const admin = await Admin.findOne({ _id:id})
                                if(!admin)
                                {
                                    res.status(400).json({
                                                  success : false ,
                                                  checkAdminMessage : ' admin not found'
                                    })
                                }
                                else
                                {
                                   const isOldPasswordValid = await bcrypt.compare(oldPassword , admin.password)
                                      if(!isOldPasswordValid)
                                      {
                                        return res.status(400).json({
                                                           success : false ,
                                                           OldPasswordValidMessage : 'old password not valid'
                                        })
                                      }

                                      // bcrypt the old password
                                      const hashedNewPassword = await bcrypt.hash(newPassword , 10)
                                      admin.password = hashedNewPassword
                                      await admin.save()

                                      return res.status(200).json({
                                                               success : true ,
                                                               successMessage : 'password change successfully'
                                      })
                                }
                        } catch (error) {
                            return res.status(500).json({
                                               success : false ,
                                               serverErrorMessage : 'server error ',
                                               error_message : error.message
                            })
                        }
                     }

// APi for update Admin profile
                    const updateAdminProfile = async (req, res) => {
                    try {
                    const adminId = req.params.adminId;
                    const { firstName , lastName , email} = req.body                      

                    const requiredFields = [
                    'firstName' ,
                    'lastName' ,
                    'email'                    
                    ];
                    for (const field of requiredFields) {
                    if (!req.body[field]) {
                    return res.status(400).json({ message: `Missing ${field.replace('_', ' ')} field`, success: false });
                    }
                    }

                    // Check for admin existence
                    const admin = await Admin.findById(adminId);

                    if (!admin) {
                    return res.status(400).json({
                    success: false,
                    message: "Admin not found",
                    });
                    }
                    // Update firstName, lastName, and email
                    admin.firstName = firstName
                    admin.lastName = lastName
                    admin.email = email

                    const profile = req.file.filename;
                    const adminName = firstName + ' ' + lastName
                    // Check if admin already has a profile image
                    if (admin.profileImage) {
                    // Admin has a profile image, update it
                    admin.profileImage = profile;
                    await admin.save();
                    await blogModel.updateMany({ adminId : adminId }, { $set: { adminName : adminName , admin_email : email } });
                    await jobModel.updateMany({ adminId : adminId }, { $set: { adminName : adminName , admin_email : email } });
                    return res.status(200).json({
                    success: true,
                    message: 'Profile image and Information updated successfully',
                    });
                    } else {
                    // Admin does not have a profile image, create it
                    admin.profileImage = profile;
                    await admin.save();
                     
                        const blog_admin = await blogModel.findOne({ adminId : adminId });
                        if (!blog_admin) {
                            return res.status(400).json({
                            success: false,
                            message: 'blog_admin not found in blogModel',
                            });
                        }
                        blog_admin.adminName = adminName;
                        blog_admin.admin_email = email
                        await blog_admin.save();

                        // job admin 
                        const job_admin = await jobModel.findOne({ adminId : adminId });
                        if (!job_admin) {
                            return res.status(400).json({
                            success: false,
                            message: 'job_admin not found in jobModel',
                            });
                        }
                        job_admin.adminName = adminName;
                        job_admin.admin_email = email
                        await job_admin.save();

                    return res.status(200).json({
                    success: true,
                    message: 'new Profile image created and information updated successfully',
                    });
                    }
                    } catch (error) {
                   
                    return res.status(500).json({
                    success: false,
                    message: "server error",
                    error_message : error.message
                    });
                    }
                    };
// APi for forgetPasswod and generate OTP
                              const forgetPassOTP = async (req, res) => {
                                try {
                                    const { email } = req.body;
                            
                                    if (!email || !isValidEmail(email)) {
                                        return res.status(400).json({
                                            success: false,
                                            message: "Valid email is required"
                                        });
                                    }
                            
                                    const admin = await Admin.findOne({ email });
                            
                                    if (!admin) {
                                        return res.status(404).json({ success: false, message: ' admin with given email not found' });
                                    }
                            
                                    const otp = generateOTP();
                            
                                    // Save the OTP in the otpModel
                                    const otpData = {
                                        adminId: admin._id,
                                        otp: otp
                                    };
                                    await otpModel.create(otpData);
                            
                                    const link = `Your OTP for password reset: ${otp} `;
                                    await sendEmails(admin.email, "Password reset", link);
                            
                                    res.status(200).json({ success: true, 
                                                             message: "An OTP has been sent to your email",
                                                             email: admin.email , 
                                                             
                                                             });
                                } catch (error) {
                                    console.error('error', error);
                                    res.status(500).json({ success: false, message: "server Error", error_message: error.message });
                                }
                            
                                function isValidEmail(email) {
                                    // email validation
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    return emailRegex.test(email);
                                }
                            
                                function generateOTP() {
                                    const otp = Math.floor(1000 + Math.random() * 9000).toString();
                                    return otp.slice(0, 4);
                                }
                            };                                               

       
                             // APi for verify OTP
                     const verifyOTP = async(req,res)=>{
                        try {
                          const { otp } = req.body
                          if(!otp)
                          {
                            return res.status(400).json({ success : false , message : ' otp is required' })
                          }
                          const adminOTP = await otpModel.findOne ({ otp })
                          if(!adminOTP)
                          {
                            return res.status(400).json({ success : false , message : ' Invalid OTP or expired' })
                          }
                          res.status(200).json({ success : true , message : 'otp verified successfully' , adminId : adminOTP.adminId})
                        } catch (error) {
                          return res.status(500).json({
                                      success : false ,
                                      message : 'server error',
                                      error_message : error.message
                          })
                        }
                       }
        // APi for otp verify and reset password for forget password 
                
                                    const adminResetPass = async (req, res) => {
                                        try {
                                            const { password, confirmPassword } = req.body;
                                            const adminId = req.params.adminId;
                                    
                                            if (!password) {
                                                return res.status(400).json({ success: false, message: 'Password is required' });
                                            }
                                    
                                            if (password !== confirmPassword) {
                                                return res.status(400).json({ success: false, message: 'Password and confirm password do not match' });
                                            }
                                    
                                            if (!adminId) {
                                                return res.status(400).json({ success: false, message: 'adminId is required' });
                                            }
                                    
                                            const admin = await Admin.findById(adminId);
                                    
                                            if (!admin) {
                                                return res.status(400).json({ success: false, message: 'Invalid adminId' });
                                            }
                                    
                                            const hashedPassword = await bcrypt.hash(password, 10);
                                            admin.password = hashedPassword;
                                            await admin.save();
                                    
                                            // Delete the used OTP
                                            await otpModel.deleteOne({ adminId });
                                    
                                            res.status(200).json({ success: true, message: 'Password reset successfully' });
                                        } catch (error) {
                                            console.error('error', error);
                                            res.status(500).json({ success: false, message: 'server error', error_message: error.message });
                                        }
                                    };
                                    
 // const get admin details
                                        const getAdmin = async ( req , res)=>{
                                            try {
                                                  const adminId = req.params.adminId
                                            // check for admin Id
                                        if(!adminId)
                                        {
                                            return res.status(400).json({
                                                               success : false ,
                                                               adminIdRequired : 'AdminId is required'
                                            })
                                        }
                                            
                                                  // check for admin
                                            const admin = await Admin.findOne({ _id : adminId })

                                            if(!admin)
                                            {
                                                return res.status(400).json({
                                                          success : false ,
                                                          adminExistanceMessage : 'admin not found'
                                                })
                                            }
                                            else{
                                                return res.status(200).json({
                                                                    success : true ,
                                                                    successMessage : 'admin Details' ,
                                                                    Admin_Details : admin
                                                })
                                            }                                 

                                            

                                            } catch (error) {
                                                return res.status(500).json({
                                                            success : false ,
                                                            serverErrorMessage : 'server Error',
                                                            error_message : error.message
                                                })
                                            }
                                        }
 
                                                         /* JOB management */

 // API for create Job
     
                            const createJob = async (req, res) => {
                                try {
                                       const adminId = req.params.adminId
                                       const { job_Heading, job_Desciption, company_Address, Salary ,Job_Experience ,job_expired_Date  } = req.body;

                                       // check for admin 
                                       const admin = await Admin.findOne({ _id : adminId })
                                       if(!admin)
                                       {
                                        return res.status(400).json({
                                                            success : false ,
                                                            adminExistanceMessage : 'admin not found' 
                                        })
                                       }
                                        
                                       // get admin Details
                                       const adminName = admin.firstName
                                       const admin_email  = admin.email
                                   
                                    // Validation
                                    const requiredFields = ['job_Heading', 'job_Desciption', 'company_Address', 'Salary' ,'Job_Experience', 'job_expired_Date'];
                                    for (const field of requiredFields) {
                                        if (!req.body[field]) {
                                            return res.status(400).json({
                                                success: false,
                                                message: `Missing ${field.replace('_', ' ')} field`,
                                            });
                                        }
                                    }
                                  
                                    // Check if job_Heading already exists
                                    const existJob = await jobModel.findOne({ job_Heading: job_Heading , company_Address  });
                                    if (existJob) {
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Job with the same job_Heading in same Company already exists',
                                        });
                                    }                                    
                                        // Split the string into day, month, and year components
                                        var dateComponents = job_expired_Date.split("-");
                                        var day = parseInt(dateComponents[0], 10);
                                        var month = parseInt(dateComponents[1], 10) - 1; 
                                        var year = parseInt(dateComponents[2], 10);

                                        // Create a Date object with the extracted components
                                        var expireDate = new Date(year, month, day);                                       

                                        const  JobImage  = req.file.filename;
                                    const newJob = new jobModel({
                                        adminId,
                                        adminName,
                                        admin_email,
                                        job_Heading,
                                        job_Description :job_Desciption ,
                                        company_Address,
                                        Salary,
                                        Job_Experience,
                                        JobImage ,
                                        job_expired_Date : expireDate,
                                        job_status: 1,
                                    });

                                    const saveJob = await newJob.save();

                                    // Response
                                    res.status(200).json({
                                        success: true,
                                        message: 'Job created successfully',
                                        job_details: {
                                            job_Heading: saveJob.job_Heading,
                                            job_Desciption: saveJob.job_Description,
                                            Salary: saveJob.Salary,
                                            Job_Experience : saveJob.Job_Experience,
                                            job_status: saveJob.job_status,
                                            JobImage : saveJob.JobImage,
                                            job_expired_Date : saveJob.job_expired_Date
                                        },
                                    });
                                } catch (error) {
                                    console.error(error);
                                    res.status(500).json({
                                        success: false,
                                        message: 'server error',
                                        error_message : error.message
                                    });
                                }
                            };

// API for update job record
                        const updateJob = async (req, res) => {
                    try {
                        const jobId = req.params.jobId;

                        // Check for job Id
                        if (!jobId) {
                            return res.status(400).json({
                                success: false,
                                jobIdRequired: 'Job Id required',
                            });
                        }

                        // Check for job existence
                        const job = await jobModel.findOne({ _id: jobId });

                        if (!job) {
                            return res.status(404).json({
                                success: false,
                                jobExistanceMessage: 'Job not found',
                            });
                        }

                        // Destructure request body
                        const {
                            job_Heading,
                            job_Description,
                            company_Address,
                            Salary,
                            Job_Experience
                        } = req.body;
                                        
                                if(!job_Heading)
                                {
                                    return res.status(400).json({
                                            success : false ,
                                            jobHeadingRequired : 'JOB heading Required'
                                    })
                                }

                                if(!job_Description)
                                {
                                    return res.status(400).json({
                                            success : false ,
                                            job_DescriptionRequired : 'job_Description Required'
                                    })
                                }
                        
                                if(!company_Address)
                                {
                                    return res.status(400).json({
                                            success : false ,
                                            company_AddressRequired : 'company_Address Required'
                                    })
                                }
                        
                                if(!Salary)
                                {
                                    return res.status(400).json({
                                            success : false ,
                                            jobHeadingRequired : 'Salary Required'
                                    })
                                }
                                if(!Job_Experience)
                                {
                                    return res.status(400).json({
                                        success : false ,
                                        jobHeadingRequired : 'Job_Experience Required'
                                })
                                }

                        // Update the job details
                        const  JobImage  = req.file.filename;
                        job.job_Heading = job_Heading;
                        job.job_Description = job_Description;
                        job.company_Address = company_Address;
                        job.Salary = Salary;
                        job.Job_Experience = Job_Experience;
                        job.JobImage = JobImage;
                        // Save the updated job
                        await job.save();

                        return res.status(200).json({
                            success: true,
                            successMessage: 'Job details updated successfully',
                        });
                    } catch (error) {
                        console.error(error);
                        return res.status(500).json({
                            success: false,
                            serverErrorMessage: 'server error',
                            error_message : error.message
                        });
                    }
                };
    
    // APi for getAll jobs
                  const getAllJobs = async(req ,res)=>{
                    try {
                           const jobs = await jobModel.find({
                           
                            
                            })
                           if(!jobs)
                           {
                            return res.status(400).json({
                                            success : false ,
                                            jobExistanceMessage : 'no job found'
                            })
                           }else
                           {
                            return res.status(200).json({ 
                                           success : true ,
                                           successMessage : 'all jobs' ,
                                           All_jobs : jobs
                            })
                           }
                    } catch (error) {
                        return res.status(500).json({
                                       success : false ,
                                       serverErrorMessage : 'server Error',
                                       error_message : error.message
                        })
                    }
                  }
    // Delete a job by Id
                                const deleteJob = async (req, res) => {
                                    try {
                                        const jobId = req.params.jobId;
                                        const job = await jobModel.findOneAndDelete({ _id: jobId });
                                
                                        if (!job) {
                                            return res.status(400).json({
                                                success: false,
                                                message: 'No job found with the given ID.',
                                            });
                                        }
                                
                                        return res.status(200).json({
                                            success: true,
                                            message: 'Job deleted successfully.',
                                        });
                                    } catch (error) {
                                        console.error('Error deleting job:', error);
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Server error',
                                            error_message : error.message
                                        });
                                    }
                                };
                                
// get job by id
                        const getJob = async ( req , res)=>{
                            try {
                                const jobId = req.params.jobId
                            // check for job Id
                        if(!jobId)
                        {
                            return res.status(400).json({
                                            success : false ,
                                            jobIdRequired : 'jobId is required'
                            })
                        }
                            
                                // check for JOb
                            const job = await jobModel.findOne({ _id : jobId })

                            if(!job)
                            {
                                return res.status(400).json({
                                        success : false ,
                                        jobExistanceMessage : 'job not found'
                                })
                            }
                            else{
                                return res.status(200).json({
                                                    success : true ,
                                                    successMessage : 'job Details' ,
                                                    job_Details : job
                                })
                            } 

                            } catch (error) {
                                return res.status(500).json({
                                            success : false ,
                                            serverErrorMessage : 'server Error',
                                            error_message : error.message
                                })
                            }
                        }
    // check and toggle job status
     const checkAndToggleStatus = async (req ,res)=>{
                            try {
                                const jobId = req.params.jobId
                                // check for job existance
                           const job = await jobModel.findOne({ _id : jobId })
                           if(!job)
                           {
                            return res.status(400).json({ success : false , jobExistanceMessage : 'job not found'})
                           }
                           // toggle the job status
        
                           const currentStatus = job.job_status
                           const newStatus = 1 - currentStatus
                           job.job_status = newStatus
                           let message;
                           if (newStatus === 1) {
                               message = 'JOB activated successfully.';
                           } else {
                               message = 'JOB inactivated successfully.';
                           }
                              // save the update status in job
                               await job.save()
                              return res.status(200).json({
                                                  success : true , 
                                                  successMessage : message ,
                                                  
                              })
                            } catch (error) {
                                
                                return res.status(500).json({
                                            success : false ,
                                            serverErrorMessage : ' there is server error ',
                                            error_message : error.message
                                })
                            }
                          }    
                        
                                          /* Blog Management */
    
    // API for create Blog
                                        const createBlog = async (req, res) => {
                                            try {
                                                const adminId = req.params.adminId;
                                                const { blog_Heading, blog_Desciption } = req.body;
                                        
                                                // Check for adminId
                                                if (!adminId) {
                                                    return res.status(400).json({
                                                        success: false,
                                                        adminIdRequired: 'Admin Id is required',
                                                    });
                                                }
                                        
                                                // Check if admin exists
                                                const admin = await Admin.findOne({ _id: adminId });
                                                if (!admin) {
                                                    return res.status(400).json({
                                                        success: false,
                                                        adminExistanceMessage: 'Admin not found',
                                                    });
                                                }
                                        
                                                // Get admin details
                                                const { firstName: adminName, email: admin_email } = admin;
                                        
                                                // Check for required fields
                                                if (!blog_Heading) {
                                                    return res.status(400).json({
                                                        success: false,
                                                        blogHeadingRequired: 'Blog heading is required',
                                                    });
                                                }
                                        
                                                if (!blog_Desciption) {
                                                    return res.status(400).json({
                                                        success: false,
                                                        blog_DesciptionRequired: 'Blog description is required',
                                                    });
                                                }
                                        
                                                // Check if blog already exists
                                                const blog = await blogModel.findOne({ blog_Heading: blog_Heading });
                                                if (blog) {
                                                    return res.status(400).json({
                                                        success: false,
                                                        blogExistanceMessage: `Blog with heading '${blog_Heading}' already exists`,
                                                    });
                                                }
                                        
                                                const blogImage = req.file.filename;
                                        
                                                const newBlog = new blogModel({
                                                    adminId,
                                                    adminName,
                                                    admin_email,
                                                    blog_Heading,
                                                    blog_Desciption,
                                                    blogImage,
                                                    blog_status: 0,
                                                });
                                        
                                                const savedBlog = await newBlog.save();
                                        
                                                return res.status(200).json({
                                                    success: true,
                                                    successMessage: 'New blog created successfully',
                                                    blog_Details: savedBlog,
                                                });
                                            } catch (error) {
                                                return res.status(500).json({
                                                    success: false,
                                                    serverErrorMessage: 'Server error',
                                                    error_message : error.message
                                                });
                                            }
                                        };
    // get all blogs
                        const getAllBlogs = async( req ,res)=>{
                            try {
                                   const AllBlogs = await blogModel.find({ })
                                   if(!AllBlogs)
                                {
                                    return res.status(400).json({
                                                success : false ,
                                                blogExistanceMessage : 'no blogs exist'
                                    })
                                }else
                                {
                                    return res.status(200).json({
                                                                   success : true ,
                                                                  successMessage : 'all Blogs',
                                                                  all_blogs : AllBlogs
                                    })
                                }

                            } catch (error) {
                                return res.status(500).json({
                                          success : false ,
                                          serverErrorMessage : 'server error',
                                          error_message : error.message
                                })
                            }
                        }
        // get blog by Id 
            const getBlog = async ( req , res)=>{
                            try {
                                const blogId = req.params.blogId
                            // check for job Id
                        if(!blogId)
                        {
                            return res.status(400).json({
                                            success : false ,
                                            blogIdRequired : 'blogId is required'
                            })
                        }
                            
                                // check for JOb
                            const blog = await blogModel.findOne({ _id : blogId })

                            if(!blog)
                            {
                                return res.status(400).json({
                                        success : false ,
                                        blogExistanceMessage : 'blog not found'
                                })
                            }
                            else{
                                return res.status(200).json({
                                                    success : true ,
                                                    successMessage : 'blog Details' ,
                                                    blog_Details : blog
                                })
                            } 

                            } catch (error) {
                                return res.status(500).json({
                                            success : false ,
                                            serverErrorMessage : 'server Error',
                                            error_message : error.message
                                })
                            }
                        }
  
      // API for update blog by Id
                                const updateBlog = async (req, res) => {
                                    try {
                                        const blogId = req.params.blogId;
                                        const { blogHeading, blogDescription } = req.body;
                                
                                        if (!blogId) {
                                            return res.status(400).json({
                                                success: false,
                                                blogIdRequired: 'Blog Id required'
                                            });
                                        }
                                
                                        // Check for blog existence
                                        const blog = await blogModel.findOne({ _id: blogId });
                                
                                        if (!blog) {
                                            return res.status(404).json({
                                                success: false,
                                                message: 'Blog not found.',
                                            });
                                        }
                                
                                        // Update the blog details
                                        blog.blog_Heading = blogHeading;
                                        blog.blog_Desciption = blogDescription;
                                
                                        if (req.file) {
                                            // A new blogImage is provided
                                            const image = req.file.filename;
                                
                                            // Check if blog already has a blogImage
                                            if (blog.blogImage) {
                                                // Blog has an image, update it
                                                blog.blogImage = image;
                                            } else {
                                                // Blog does not have a blog image, create it
                                                blog.blogImage = image;
                                            }
                                        }
                                
                                        // Save the updated blog
                                        await blog.save();
                                
                                        return res.status(200).json({
                                            success: true,
                                            message: 'Blog information updated successfully.',
                                        });
                                    } catch (error) {
                                        return res.status(500).json({
                                            success: false,
                                            serverErrorMessage: 'Server Error',
                                            error_message : error.message
                                        });
                                    }
                                };
    
    // check and toggle 
                                const checkAndToggle_BlogStatus = async (req ,res)=>{
                                    try {
                                        const blogId = req.params.blogId
                                        // check for blog existance
                                   const blog = await blogModel.findOne({ _id : blogId })
                                   if(!blog)
                                   {
                                    return res.status(400).json({ success : false , blogExistanceMessage : 'blog not found'})
                                   }
                                   // toggle the blog status
                
                                   const currentStatus = blog.blog_status
                                   const newStatus = 1 - currentStatus
                                   blog.blog_status = newStatus
                                      
                                       await blog.save()
                                       let message;
                                        if (newStatus === 1) {
                                            message = 'Blog activated successfully.';
                                        } else {
                                            message = 'Blog inactivated successfully.';
                                        }
                                           
                                              
                                      return res.status(200).json({
                                                          success : true , 
                                                          successMessage : message ,
                                                          
                                      })
                                    } catch (error) {
                                        return res.status(500).json({
                                                    success : false ,
                                                    serverErrorMessage : 'server error ',
                                                    error_message : error.message
                                        })
                                    }
                                  }    
                                
  // APi for delete Blog by Id
                                const deleteBlog = async ( req , res)=> {
                                    try {
                                           const blogId = req.params.blogId
                                       // blog Id required
                                       if(!blogId)
                                       {
                                        return res.status(400).json({
                                                      success : false ,
                                                      blogIdRequired : 'blog Id required'
                                        })
                                       }

                                       // check for blog and delete
                                    const blog = await blogModel.findOneAndDelete({ _id : blogId })

                                    if(!blog)
                                    {
                                        return res.status(400).json({
                                                      success : false ,
                                                      blogExistanceMessage : 'blog not found'
                                        })
                                    }else
                                    {
                                        return res.status(200).json({
                                                   success : true ,
                                                   successMessage : 'blog Deleted successfully'
                                        })
                                    }
                                    } catch (error) {
                                        return res.status(500).json({
                                                 success : false ,
                                                 serverErrorMessage : 'server error',
                                                 error_message : error.message
                                        })
                                    }
                                }
        
    // APi for apply on job 
                            const apply_on_Job = async (req, res) => {
                                try {
                                const  jobId  = req.params.jobId   
                                const {userName , user_Email  ,  phone_no }  = req.body    
                                
                                
                                    // Check for job Id required
                                if (!jobId) {
                                    return res.status(400).json({
                                    success: false,
                                    jobId_message : 'job Id required',
                                    });
                                }
                                if (!userName) {
                                    return res.status(400).json({
                                    success: false,
                                    userName_message : 'userName required',
                                    });
                                }
                                if (!user_Email) {
                                    return res.status(400).json({
                                    success: false,
                                    user_Email_message : 'user_Email required',
                                    });
                                }
                                if (!phone_no) {
                                    return res.status(400).json({
                                    success: false,
                                    phone_no_message : 'phone_no required',
                                    });
                                }
                                
                                // Check for job
                                const job = await jobModel.findOne({ _id : jobId ,
                                    job_status : 1
                                })
                                
                                if (!job) {
                                    return res.status(400).json({
                                    success: false,
                                    jobExistanceMessage: 'job not found',
                                    });
                                }
                                            
                                // Check if the user has already applied to the job
                                const existingApplication = await appliedjobModel.findOne({ user_Email, jobId });
                                if (existingApplication) {
                                    return res.status(400).json({
                                    success: false,
                                    jobErrorMessage: 'already applied job',
                                    });
                                }
                            
                                // Check if the resume file is provided
                                if (!req.file) {
                                    return res.status(400).json({
                                    success: false,
                                    resumeRequired: 'Resume file is required',
                                    });
                                }
                            
                                const uploadResume = req.file.filename;
                            
                                // Create a new application for the job
                                const newApplication = new appliedjobModel({
                                    userName,
                                    user_Email,
                                    phone_no,
                                    job_Heading : job.job_Heading,
                                    jobId,
                                    Salary: job.Salary,
                                    job_status : 1,
                                    uploadResume,
                                    job_expired_Date: job.job_expired_Date,
                                });
                            
                                await newApplication.save();
                            
                                return res.status(200).json({
                                    success: true,
                                    message : 'Job applied successfully',
                                    appliedJob_Details : newApplication
                                });
                                } catch (error) {
                                
                                return res.status(500).json({
                                    success: false,
                                    message: 'Server error',
                                    error_message : error.message
                                });
                                }
                            };
                            
    
    // APi for get applied job using job Id
                            const getAppliedJob = async (req, res) => {
                                try {
                                const jobId = req.params.jobId;
                            
                                // job Id required
                                if (!jobId) {
                                    return res.status(400).json({
                                    success: false,
                                    jobIdRequired: 'job Id Required',
                                    });
                                }
                            
                                // check for job
                                const job = await jobModel.findOne({ _id: jobId, job_status: 1 });
                            
                                if (!job) {
                                    return res.status(400).json({
                                    success: false,
                                    jobExistanceMessage: 'job not exist in job model',
                                    });
                                }
                            
                                // check for applied job
                                const appliedJobs = await appliedjobModel.find({ jobId: jobId });
                            
                                if (!appliedJobs || appliedJobs.length === 0) {
                                    return res.status(400).json({
                                    success: false,
                                    appliedJobMessage: 'No jobs applied for this jobId',
                                    });
                                }
                            
                                // Map applied jobs to get only relevant details
                                const appliedJob_Details = appliedJobs.map((appliedJob) => {
                                    return {
                                    userName: appliedJob.userName,
                                    user_Email: appliedJob.user_Email,
                                    phone_no: appliedJob.phone_no,
                                    job_Heading: appliedJob.job_Heading,
                                    Salary: appliedJob.Salary,
                                    uploadResume: appliedJob.uploadResume,
                                    job_expired_Date: appliedJob.job_expired_Date,
                                    _id:appliedJob._id,
                                    createdAt : appliedJob.createdAt,
                                    updatedAt : appliedJob.updatedAt

                                    };
                                });
                            
                                return res.status(200).json({
                                    success: true,
                                    appliedJobCount : appliedJob_Details.length,
                                    appliedJobDetails: appliedJob_Details
                                    
                                });
                                } catch (error) {
                                console.error(error);
                                return res.status(500).json({
                                    success: false,
                                    serverErrorMessage: 'Server error',
                                    error_message : error.message
                                });
                                }
                            };
     
                     // API for Delete user Resume response
                    const Delete_user_resume = async ( req ,res)=>{
                        try {
                               const apliedjobId = req.params.apliedjobId
                            const appliedJob = await appliedjobModel.findOneAndDelete({ _id : apliedjobId })
                        if(!appliedJob)
                        {
                            return res.status(400).json({
                                           success : false ,
                                           jobExistanceMessage : 'job not found'
                            })
                        }
                        else
                        {
                            return res.status(200).json({
                                           success : true ,
                                          successMessage : 'applied resume deleted successfully'
                            })
                        }
                        } catch (error) {
                            return res.status(500).json({
                                      success : false ,
                                      serverErrorMessage : 'server error',
                                      error_message : error.message
                            })
                        }
                    }
        // APi for get count of details
                      const getAllDetailsCount = async(req ,res)=>{
                        try {
                               // check for all blogs
                            const allBlogs = await blogModel.find({})
                            if(!allBlogs)
                            {
                                return res.status(400).json({
                                              success : false ,
                                              jBlofExistanceMessage : 'BLOG Not found'
                                })
                            }
                              const blogLength = allBlogs.length
                         // check for all jobs
                            const All_jobs = await jobModel.find({})
                            if(!All_jobs)
                            {
                                return res.status(400).json({
                                              success : false ,
                                              jBlofExistanceMessage : 'jobs Not found'
                                })
                            }
                              const jobsLength = All_jobs.length

                              return res.status(200).json({
                                           success : true ,
                                           details : {
                                               total_Jobs : jobsLength,
                                               total_Blogs : blogLength
                                           }
                              })
                         
                        } catch (error) {
                            return res.status(500).json({
                                        success : false ,
                                        serverErrorMessage : 'server error',
                                        error_message : error.message
                            })
                        }
                      }

    // APi for contact us page
    const contact_us = async (req, res) => {
        try {
            const { userName, user_Email, user_phone, message, Company, Subject } = req.body;
            
            // Check for required fields individually
            if (!userName) {
                return res.status(400).json({
                    success: false,
                    userName_message: 'User name is required'
                });
            }
            if (!user_Email) {
                return res.status(400).json({
                    success: false,
                    user_Email_message: 'User Email is required'
                });
            }
            if (!user_phone) {
                return res.status(400).json({
                    success: false,
                    user_phone_message: 'User phone is required'
                });
            }
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }
            if (!Company) {
                return res.status(400).json({
                    success: false,
                    Company_message: 'Company is required'
                });
            }
            if (!Subject) {
                return res.status(400).json({
                    success: false,
                    Subject_message: 'Subject is required'
                });
            }
            
            // Create a new contact
            const newContact = new contactUs({
                userName,
                user_Email,
                user_phone,
                message,
                Company,
                Subject
            });
            
            // Save the contact to the database
            await newContact.save();
    
            return res.status(200).json({
                success: true,
                message: 'Data saved successfully',
                Details: newContact
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    };
    

    // Api for get all Contact us details
         const getAll_contact = async( req , res)=>{
            try {
                    const allContact_Details = await contactUs.find({ })
                    if(!allContact_Details)
                    {
                        return res.status(400).json({
                             success : false ,
                             contact_Details_message : 'no details found',
                            
                        })
                    }
                    else
                    {
                        return res.status(200).json({
                              success : true ,
                              message : 'all contact details',
                              all_contact_Details : allContact_Details
                        })
                    }
            } catch (error) {
                return res.status(500).json({
                            success : false ,
                            message : 'server error'
                })
            }
         }

// APi for delete particular contact details 
               const delete_contactPage_details = async ( req ,res)=>{
                try {
                     const contact_id = req.params.contact_id
                     // check for contact_id 
                    if(!contact_id)
                    {
                        return res.status(400).json({
                            success : false ,
                            contact_id_message : 'contact_id required'
                        })
                    }

                    // check for detail
                const contactData = await contactUs.findOneAndDelete({ _id : contact_id })
                if(!contactData)
                {
                    return res.status(400).json({
                           success : false ,
                           contact_message : 'no details found'
                           
                    })
                }
                else
                {
                    return res.status(200).json({
                             success : true,
                             message : 'contact_us details Deleted successfully'
                    })
                }
                } catch (error) {
                    return res.status(500).json({
                         success : false ,
                         message : 'server error'
                    })
                }
               }


                                       /*  Job Management in french */
            // API for create Job in french
     
            const createJob_fr = async (req, res) => {
                try {
                    const adminId = req.params.adminId;
                    const { job_Heading_fr, job_Description_fr, company_Address_fr, Salary_fr, Job_Experience_fr, job_expired_Date_fr } = req.body;
            
                    const admin = await Admin.findOne({ _id: adminId });
                    if (!admin) {
                        return res.status(400).json({
                            success: false,
                            message: 'Administrateur introuvable'
                        });
                    }
            
                    const adminName = admin.firstName;
                    const admin_email = admin.email;
            
                    const requiredFields = ['job_Heading_fr', 'job_Description_fr', 'company_Address_fr', 'Salary_fr', 'Job_Experience_fr', 'job_expired_Date_fr'];
                    for (const field of requiredFields) {
                        if (!req.body[field]) {
                            return res.status(400).json({
                                success: false,
                                message: `Champ ${field.replace('_', ' ')} manquant`
                            });
                        }
                    }
            
                    const existJob = await jobModel_fr.findOne({ job_Heading_fr , company_Address_fr });
                    if (existJob) {
                        return res.status(400).json({
                            success: false,
                            message: 'Un emploi avec le même titre dans la même entreprise existe déjà'
                        });
                    }
                                
                    let expireDate;
                    try {
                        expireDate = new Date(job_expired_Date_fr);
                        if (isNaN(expireDate)) {
                            throw new Error('Format de date invalide pour job_expired_Date_fr');
                        }
                    } catch (error) {
                        return res.status(400).json({
                            success: false,
                            message: 'Format de date invalide pour job_expired_Date_fr',
                            error: error.message
                        });
                    }
            
                    const JobImage = req.file?.filename;
            
                    const newJob = new jobModel_fr({
                        adminId,
                        adminName,
                        admin_email,
                        job_Heading_fr,
                        job_Description_fr,
                        company_Address_fr,
                        Salary_fr,
                        Job_Experience_fr,
                        JobImage_fr: JobImage,
                        job_expired_Date_fr: expireDate,
                        job_status_fr: 1,
                    });
            
                    const saveJob = await newJob.save();
            
                    res.status(200).json({
                        success: true,
                        message: 'Emploi créé avec succès',
                        job_details: saveJob
                    });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({
                        success: false,
                        message: 'Erreur du serveur',
                        error_message: error.message
                    });
                }
            }
            
    
// API for update job record in french
const updateJob_fr = async (req, res) => {
    try {
        const jobId_fr = req.params.jobId_fr;

        // Check for job Id
        if (!jobId_fr) {
            return res.status(400).json({
                success: false,
                jobId_frRequired: 'ID de travail requis',
            });
        }

        // Check for job existence
        const job = await jobModel_fr.findOne({ _id: jobId_fr });

        if (!job) {
            return res.status(400).json({
                success: false,
                jobExistanceMessage: 'Emploi introuvable',
            });
        }

        // Destructure request body
        const {
            job_Heading_fr,
            job_Description_fr,
            company_Address_fr,
            Salary_fr,
            Job_Experience_fr
        } = req.body;

        // Validation checks for mandatory fields
        if (!job_Heading_fr) {
            return res.status(400).json({
                success: false,
                jobHeadingRequired: 'job_Heading_fr Obligatoire'
            });
        }

        if (!job_Description_fr) {
            return res.status(400).json({
                success: false,
                job_DescriptionRequired: 'job_Description_fr Obligatoire'
            });
        }

        if (!company_Address_fr) {
            return res.status(400).json({
                success: false,
                company_AddressRequired: 'company_Address_fr Obligatoire'
            });
        }

        if (!Salary_fr) {
            return res.status(400).json({
                success: false,
                salaryRequired: 'Salaire_fr Obligatoire'
            });
        }

        if (!Job_Experience_fr) {
            return res.status(400).json({
                success: false,
                jobExperienceRequired: 'Job_Experience_fr Obligatoire'
            });
        }

        // Update the job details
        job.job_Heading_fr = job_Heading_fr;
        job.job_Description_fr = job_Description_fr;
        job.company_Address_fr = company_Address_fr;
        job.Salary_fr = Salary_fr;
        job.Job_Experience_fr = Job_Experience_fr;

        // Update JobImage if provided
        if (req.file) {
            const JobImage = req.file.filename;
            job.JobImage_fr = JobImage;
        }

        // Save the updated job
        await job.save();

        return res.status(200).json({
            success: true,
            successMessage: 'Les détails du travail ont été mis à jour avec succès',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            serverErrorMessage: 'erreur du serveur',
            error_message: error.message
        });
    }
};


// APi for getAll jobs
const getAllJobs_fr = async(req ,res)=>{
    try {
           const jobs = await jobModel_fr.find({
           
            
            })
           if(!jobs)
           {
            return res.status(400).json({
                            success : false ,
                            jobExistanceMessage : 'aucun emploi trouvé'
            })
           }else
           {
            return res.status(200).json({ 
                           success : true ,
                           successMessage : 'tous les emplois' ,     
                           All_jobs_fr : jobs
            })
           }
    } catch (error) {
        return res.status(500).json({
                       success : false ,
                       serverErrorMessage : 'erreur du serveur',
                       error_message : error.message
        })
    }
  }

  // APi for get particualr job

  const getJob_fr = async ( req , res)=>{
    try {
        const jobId_fr = req.params.jobId_fr
    // check for job Id french
if(!jobId_fr)
{
    return res.status(400).json({
                    success : false ,
                    jobIdRequired : 'jobId_fr est obligatoire'
    })
}
    
        // check for JOb
    const job = await jobModel_fr.findOne({ _id : jobId_fr })

    if(!job)
    {
        return res.status(400).json({
                success : false ,
                jobExistanceMessage : 'emploi introuvable'
        })
    }
    else{
        return res.status(200).json({
                            success : true ,
                            successMessage : 'job Details' ,
                            job_Details : job
        })
    } 

    } catch (error) {
        return res.status(500).json({
                    success : false ,
                    serverErrorMessage : 'détails du poste',
                    error_message : error.message
        })
    }
}

// Api for delete job french
          const deleteJob_fr = async ( req , res )=>{
            try {
                   const jobId_fr = req.params.jobId_fr
            if(!jobId_fr)
            {
                return res.status(400).json({
                       success : false,
                       jobId_fr_message : 'JobId_fr obligatoire'
                })
            }
            // check for job french
            const job = await jobModel_fr.findOneAndDelete({ _id : jobId_fr })
            if(!job)
            {
                  return res.status(400).json({
                          success : false ,
                          job_fe_message : 'job_fr non trouvé'
                  })
            }
            else
            {
                return res.status(200).json({
                          success : true ,
                          message : 'travail supprimé avec succès'
                })
            }
            } catch (error) {
                return res.status(500).json({
                         success : false ,
                         message : 'erreur du serveur',
                         error_message : error.message
                })
            }
          }
    
          
// APi for active inactive job
const active_inactive_job = async (req, res) => {
    try {
        const jobId_fr = req.params.jobId_fr;

        // Check for job existence
        const job = await jobModel_fr.findOne({ _id: jobId_fr });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Emploi introuvable' });
        }

        // Toggle the job status
        const currentStatus = job.job_status_fr;
        const newStatus = 1 - currentStatus;
        job.job_status_fr = newStatus;

        // Determine the appropriate message based on the new status
        let message;
        if (newStatus === 1) {
            message = 'Tâche activée avec succès.';
        } else {
            message = 'Tâche inactivée avec succès.';
        }

        // Save the updated status in the job
        await job.save();

        return res.status(200).json({
            success: true,
            successMessage: message,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            serverErrorMessage: 'erreur du serveur',
            error_message: error.message
        });
    }
};   

// APi for Apply on JOb french
const apply_on_Job_fr = async (req, res) => {
    try {
        const  jobId_fr  = req.params.jobId_fr;
        const { userName, user_Email, phone_no } = req.body;

        // Check for job Id required
        if (!jobId_fr) {
            return res.status(400).json({
                success: false,
                jobId_message: 'identifiant de travail requis',
            });
        }
        if (!userName) {
            return res.status(400).json({
                success: false,
                userName_message: "Nom d'utilisateur requis",
            });
        }
        if (!user_Email) {
            return res.status(400).json({
                success: false,
                user_Email_message: 'user_Email requis',
            });
        }
        if (!phone_no) {
            return res.status(400).json({
                success: false,
                phone_no_message: 'numéro de téléphone requis',
            });
        }

        // Check for job
        const job = await jobModel_fr.findOne({
            _id: jobId_fr,
            job_status_fr: 1
        });

        if (!job) {
            return res.status(400).json({
                success: false,
                jobExistanceMessage: 'emploi introuvable',
            });
        }

        // Check if the user has already applied to the job
        const existingApplication = await appliedjob_fr_Model.findOne({ user_Email, jobId_fr });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                jobErrorMessage: 'emploi déjà postulé',
            });
        }

        // Check if the resume file is provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                resumeRequired: 'Le fichier de reprise est requis',
            });
        }

        const uploadResume = req.file.filename;

       

        // Create a new application for the job
        const newApplication = new appliedjob_fr_Model({
            userName,
            user_Email,
            phone_no,
            job_Heading_fr: job.job_Heading_fr,
            jobId_fr,
            Salary_fr : job.Salary_fr,
            uploadResume,
            job_expired_Date_fr: job.job_expired_Date_fr,
        });

        await newApplication.save();

        return res.status(200).json({
            success: true,
            message: 'Emploi postulé avec succès',
            appliedJob_Details: newApplication
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Erreur du serveur',
            error_message: error.message
        });
    }
};

     // APi for get applied job using jobId_fr
     const getAppliedJob_fr = async (req, res) => {
        try {
        const jobId_fr = req.params.jobId_fr;
    
        // job Id required
        if (!jobId_fr) {
            return res.status(400).json({
            success: false,
            jobIdRequired: 'ID de travail requis',
            });
        }
    
        // check for job
        const job = await jobModel_fr.findOne({ _id: jobId_fr, job_status_fr: 1 });
    
        if (!job) {
            return res.status(400).json({
            success: false,
            jobExistanceMessage: "le travail n'existe pas dans jobModel",
            });
        }
    
        // check for applied job
        const appliedJobs = await appliedjob_fr_Model.find({ jobId_fr: jobId_fr });
    
        if (!appliedJobs || appliedJobs.length === 0) {
            return res.status(400).json({
            success: false,
            appliedJobMessage: 'Aucun emploi postulé pour ce jobId',
            });
        }
    
        // Map applied jobs to get only relevant details
        const appliedJob_Details = appliedJobs.map((appliedJob) => {
            return {
            userName: appliedJob.userName,
            user_Email: appliedJob.user_Email,
            phone_no: appliedJob.phone_no,
            job_Heading_fr: appliedJob.job_Heading_fr,
            Salary_fr: appliedJob.Salary_fr,
            uploadResume: appliedJob.uploadResume,
            job_expired_Date_fr: appliedJob.job_expired_Date_fr,
            _id:appliedJob._id,
            createdAt : appliedJob.createdAt,
            updatedAt : appliedJob.updatedAt

            };
        });
    
        return res.status(200).json({
            success: true,
            appliedJobCount : appliedJob_Details.length,
            appliedJobDetails: appliedJob_Details
            
        });
        } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            serverErrorMessage: 'Erreur du serveur',
            error_message : error.message
        });
        }
    };

       // API for Delete user Resume response
       const Delete_user_resume_fr = async ( req ,res)=>{
        try {
               const apliedjobId_fr = req.params.apliedjobId_fr
            const appliedJob = await appliedjob_fr_Model.findOneAndDelete({ _id : apliedjobId_fr })
        if(!appliedJob)
        {
            return res.status(400).json({
                           success : false ,
                           jobExistanceMessage : 'emploi introuvable'
            })
        }
        else
        {
            return res.status(200).json({
                           success : true ,
                          successMessage : 'CV appliqué supprimé avec succès'
            })
        }
        } catch (error) {
            return res.status(500).json({
                      success : false ,
                      serverErrorMessage : 'erreur du serveur',
                      error_message : error.message
            })
        }
    }


      // API for create Blog french
      const createBlog_fr = async (req, res) => {
        try {
            const adminId = req.params.adminId;
            const { blog_Heading_fr, blog_Desciption_fr } = req.body;
    
            // Check for adminId
            if (!adminId) {
                return res.status(400).json({
                    success: false,
                    adminIdRequired: "L'identifiant d'administrateur est requis",
                });
            }
    
            // Check if admin exists
            const admin = await Admin.findOne({ _id: adminId });
            if (!admin) {
                return res.status(400).json({
                    success: false,
                    adminExistanceMessage: 'Administrateur introuvable',
                });
            }
    
            // Get admin details
            const { firstName: adminName, email: admin_email } = admin;
    
            // Check for required fields
            if (!blog_Heading_fr) {
                return res.status(400).json({
                    success: false,
                    blogHeadingRequired: 'Le titre du blog est obligatoire',
                });
            }
    
            if (!blog_Desciption_fr) {
                return res.status(400).json({
                    success: false,
                    blog_DesciptionRequired: 'La description du blog est obligatoire',
                });
            }
    
            // Check if blog already exists
            const blog = await blogModel_fr.findOne({ blog_Heading_fr: blog_Heading_fr });
            if (blog) {
                return res.status(400).json({
                    success: false,
                    blogExistanceMessage: `Blog avec titre '${blog_Heading_fr}' existe déjà`,
                });
            }
    
            const blogImage = req.file.filename;
    
            const newBlog = new blogModel_fr({
                adminId,
                adminName,
                admin_email,
                blog_Heading_fr,
                blog_Desciption_fr,
                blogImage_fr : blogImage,
                blog_status_fr: 0,
            });
    
            const savedBlog = await newBlog.save();
    
            return res.status(200).json({
                success: true,
                successMessage: 'Nouveau blog créé avec succès',
                blog_Details: savedBlog,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                serverErrorMessage: 'Erreur du serveur',
                error_message : error.message
            });
        }
    };



// get all blogs
                    const getAllBlogs_fr = async( req ,res)=>{
                        try {
                               const AllBlogs = await blogModel_fr.find({ })
                               if(!AllBlogs)
                            {
                                return res.status(400).json({
                                            success : false ,
                                            blogExistanceMessage : "aucun blog n'existe"
                                })
                            } else
                            {
                                return res.status(200).json({
                                                               success : true ,
                                                              successMessage : 'tous les blogs',
                                                              all_blogs : AllBlogs
                                })
                            }

                        } catch (error) {
                            return res.status(500).json({
                                      success : false ,
                                      serverErrorMessage : 'erreur du serveur',
                                      error_message : error.message
                            })
                        }
                    }


    // get blog by Id 
    const getBlog_fr = async ( req , res)=>{
        try {
            const blogId_fr = req.params.blogId_fr
        // check for job Id
    if(!blogId_fr)
    {
        return res.status(400).json({
                        success : false ,
                        blogIdRequired : 'blogId_fr est obligatoire'
        })
    }
        
            // check for JOb
        const blog = await blogModel_fr.findOne({ _id : blogId_fr })

        if(!blog)
        {
            return res.status(400).json({
                    success : false ,
                    blogExistanceMessage : 'blog introuvable'
            })
        }
        else{
            return res.status(200).json({
                                success : true ,
                                successMessage : 'Détails du blog' ,
                                blog_Details : blog
            })
        } 

        } catch (error) {
            return res.status(500).json({
                        success : false ,
                        serverErrorMessage : 'erreur du serveur',
                        error_message : error.message
            })
        }
    }

    // API for update blog by Id
    const updateBlog_fr = async (req, res) => {
        try {
            const blogId_fr = req.params.blogId_fr;
            const { blog_Heading_fr, blogDescription_fr } = req.body;
    
            if (!blogId_fr) {
                return res.status(400).json({
                    success: false,
                    blogIdRequired: 'Identifiant du blog requis'
                });
            }
    
            // Check for blog existence
            const blog = await blogModel_fr.findOne({ _id: blogId_fr });
    
            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message: 'Blog introuvable.',
                });
            }
    
            // Update the blog details
            blog.blog_Heading_fr = blog_Heading_fr;
            blog.blog_Desciption_fr = blogDescription_fr;
    
            if (req.file) {
                // A new blogImage is provided
                const image = req.file.filename;
    
                // Check if blog already has a blogImage
                if (blog.blogImage_fr) {
                    // Blog has an image, update it
                    blog.blogImage_fr = image;
                } else {
                    // Blog does not have a blog image, create it
                    blog.blogImage_fr = image;
                }
            }
    
            // Save the updated blog
            await blog.save();
    
            return res.status(200).json({
                success: true,
                message: 'Les informations du blog ont été mises à jour avec succès.',
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                serverErrorMessage: 'erreur du serveur',
                error_message : error.message
            });
        }
    };


      // check and toggle 
      const active_inactive_blog = async (req ,res)=>{
        try {
            const blogId_fr = req.params.blogId_fr
            // check for blog existance
       const blog = await blogModel_fr.findOne({ _id : blogId_fr })
       if(!blog)
       {
        return res.status(400).json({ success : false , blogExistanceMessage : 'blog introuvable'})
       }
       // toggle the blog status

       const currentStatus = blog.blog_status_fr
       const newStatus = 1 - currentStatus
       blog.blog_status_fr = newStatus
          
           await blog.save()
           let message;
            if (newStatus === 1) {
                message = 'Blog activéé avec succès.';
            } else {
                message = 'Blog inactivéé avec succès.';
            }
               
                  
          return res.status(200).json({
                              success : true , 
                              successMessage : message ,
                              
          })
        } catch (error) {
            return res.status(500).json({
                        success : false ,
                        serverErrorMessage : 'erreur du serveur ',
                        error_message : error.message
            })
        }
      }    


       // APi for delete Blog by Id
       const deleteBlog_fr = async ( req , res)=> {
        try {
               const blogId_fr = req.params.blogId_fr
           // blog Id required
           if(!blogId_fr)
           {
            return res.status(400).json({
                          success : false ,
                          blogIdRequired : 'Identifiant du blog requis'
            })
           }

           // check for blog and delete
        const blog = await blogModel_fr.findOneAndDelete({ _id : blogId_fr })

        if(!blog)
        {
            return res.status(400).json({
                          success : false ,
                          blogExistanceMessage : 'blog introuvable'
            })
        }else
        {
            return res.status(200).json({
                       success : true ,
                       successMessage : 'blog supprimé avec succès'
            })
        }
        } catch (error) {
            return res.status(500).json({
                     success : false ,
                     serverErrorMessage : 'erreur du serveur',
                     error_message : error.message
            })
        }
    }

      // APi for contact us page
      const contact_us_fr = async (req, res) => {
        try {
            const { userName, user_Email, user_phone, message, Company, Subject } = req.body;
            
            // Check for required fields individually
            if (!userName) {
                return res.status(400).json({
                    success: false,
                    userName_message: "Nom d'utilisateur est nécessaire"
                });
            }
            if (!user_Email) {
                return res.status(400).json({
                    success: false,
                    user_Email_message: "L'e-mail de l'utilisateur est requis"
                });
            }
            if (!user_phone) {
                return res.status(400).json({
                    success: false,
                    user_phone_message: "Le téléphone de l'utilisateur est requis"
                });
            }
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Le message est requis'
                });
            }
            if (!Company) {
                return res.status(400).json({
                    success: false,
                    Company_message: 'La société est requise'
                });
            }
            if (!Subject) {
                return res.status(400).json({
                    success: false,
                    Subject_message: 'Le sujet est obligatoire'
                });
            }
            
            // Create a new contact
            const newContact = new contactUs_fr({
                userName,
                user_Email,
                user_phone,
                message,
                Company,
                Subject
            });
            
            // Save the contact to the database
            await newContact.save();
    
            return res.status(200).json({
                success: true,
                message: 'Données enregistrées avec succès',
                Details: newContact
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'erreur du serveur'
            });
        }
    };
    

    // Api for get all Contact us details
    const getAll_contact_fr = async( req , res)=>{
        try {
                const allContact_Details = await contactUs_fr.find({ })
                if(!allContact_Details)
                {
                    return res.status(400).json({
                         success : false ,
                         contact_Details_message : 'aucun détail trouvé',
                        
                    })
                }
                else
                {
                    return res.status(200).json({
                          success : true ,
                          message : 'toutes les coordonnées',
                          all_contact_Details : allContact_Details
                    })
                }
        } catch (error) {
            return res.status(500).json({
                        success : false ,
                        message : 'erreur du serveur'
            })
        }
     }

     // APi for delete particular contact details 
     const delete_contactPage_details_fr = async ( req ,res)=>{
        try {
             const contact_id_fr = req.params.contact_id_fr
             // check for contact_id 
            if(!contact_id_fr)
            {
                return res.status(400).json({
                    success : false ,
                    contact_id_message : 'contact_id requis'
                })
            }

            // check for detail
        const contactData = await contactUs_fr.findOneAndDelete({ _id : contact_id_fr })
        if(!contactData)
        {
            return res.status(400).json({
                   success : false ,
                   contact_message : 'aucun détail trouvé'
                   
            })
        }
        else
        {
            return res.status(200).json({
                     success : true,
                     message : 'contact_us détails Supprimé avec succès'
            })
        }
        } catch (error) {
            return res.status(500).json({
                 success : false ,
                 message : 'erreur du serveur'
            })
        }
       }
module.exports = {  login_Admin , changeAdminPassword ,
                        updateAdminProfile , forgetPassOTP ,verifyOTP ,
                         adminResetPass , getAdmin , createJob , updateJob  , getAllJobs , deleteJob ,
                         getJob , checkAndToggleStatus, createBlog , getAllBlogs ,
                         getBlog , updateBlog , checkAndToggle_BlogStatus  , deleteBlog , 
                         getAppliedJob , Delete_user_resume , getAllDetailsCount , apply_on_Job , contact_us ,
                         getAll_contact , delete_contactPage_details ,
                         
                          /*  French code  */
                         createJob_fr , updateJob_fr  , getAllJobs_fr , getJob_fr , deleteJob_fr , active_inactive_job,
                         apply_on_Job_fr , getAppliedJob_fr , Delete_user_resume_fr , createBlog_fr ,
                         getAllBlogs_fr , getBlog_fr , updateBlog_fr , active_inactive_blog , deleteBlog_fr,
                         contact_us_fr , getAll_contact_fr , delete_contactPage_details_fr
                        
                        }
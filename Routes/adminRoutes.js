const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController')
const upload = require('../utils/uploads')
const multer = require('multer')

                                             /* Admin */
    // APi for Amdin login
                     router.post('/login_Admin', adminController.login_Admin)
    // API for Admin change password
                    router.post('/changeAdminPassword/:id', adminController.changeAdminPassword)
    // API for update Admin profile
                     router.post('/updateAdminProfile/:adminId' ,upload.single('profileImage'),  adminController.updateAdminProfile)
    // forget password Api -- 
                          //otp send  to user email account  

                    router.post('/forgetPassOTP', adminController.forgetPassOTP)

                            // verify OTP
                    router.post('/verifyOTP', adminController.verifyOTP) 

                    // reset password and token verify

                    router.post('/adminResetPass/:adminId', adminController.adminResetPass)
  // Api for get admin details
                    router.get('/getAdmin/:adminId', adminController.getAdmin)



                                              /* job management */
    // APi for create JOb 
                       router.post('/createJob/:adminId',upload.single('JobImage'),adminController.createJob)
     // API for update job details
                        router.put('/updateJob/:jobId' , upload.single('JobImage'), adminController.updateJob)
    
    // APi for get all job 
                        router.get('/getAllJobs', adminController.getAllJobs)
    // APi for delete job by id
                        router.delete('/deleteJob/:jobId', adminController.deleteJob)
   // APi for get job byid
                        router.get('/getJob/:jobId', adminController.getJob)
   // API for check and toggle status of job
                        router.post('/checkAndToggleStatus/:jobId' , adminController.checkAndToggleStatus)
   // API for applied on job
                         router.post('/apply_on_Job/:jobId',upload.single('uploadResume'),adminController.apply_on_Job )
   // APi for get AppliedJob using jobId
                         router.get('/getAppliedJob/:jobId', adminController.getAppliedJob) 
   // APi for delete Delete_user_resume
                         router.delete('/Delete_user_resume/:apliedjobId', adminController.Delete_user_resume)


                                            /* Blog Management */
    // APi for create Blog
                        router.post('/createBlog/:adminId' , upload.single('blogImage'),  adminController.createBlog)
   // APi for get all blogs
                       router.get('/getAllBlogs', adminController.getAllBlogs)
   // API for get blogs by id
                       router.get('/getBlog/:blogId', adminController.getBlog) 
   // APi for update blog by Id
                       router.put('/updateBlog/:blogId', upload.single('blogImage') , adminController.updateBlog)
   // APi for checkAndToggle_BlogStatus 
                       router.post('/checkAndToggle_BlogStatus/:blogId', adminController.checkAndToggle_BlogStatus)
   // APi for delete blog by blog id
                       router.delete('/deleteBlog/:blogId', adminController.deleteBlog)

   // API for get AllDetailsCount 
                       router.get('/getAllDetailsCount', adminController.getAllDetailsCount)

                                          /*  Contact us page */
  // Api for contact us
                        router.post('/contact_us', adminController.contact_us)
  // Api for get all Contact details
                         router.get('/getAll_contact', adminController.getAll_contact)
  // APi for Delete delete_contactPage_details 
                          router.delete('/delete_contactPage_details/:contact_id', adminController.delete_contactPage_details)

   

                                         /*   Job Management in french */
        // APi for create JOb 
        router.post('/createJob_fr/:adminId',upload.single('JobImage'),adminController.createJob_fr)
        // APi for update JOb
        router.put('/updateJob_fr/:jobId_fr' , upload.single('JobImage'), adminController.updateJob_fr)  
        // APi for get all job 
        router.get('/getAllJobs_fr', adminController.getAllJobs_fr)   
        // APi for   get particular JOb
         router.get('/getJob_fr/:jobId_fr', adminController.getJob_fr)
        // Api for Delete paricular job
         router.delete('/deleteJob_fr/:jobId_fr', adminController.deleteJob_fr)
         // Api for active inactive job
         router.post('/active_inactive_job/:jobId_fr', adminController.active_inactive_job)
         // API for applied on job
         router.post('/apply_on_Job_fr/:jobId_fr',upload.single('uploadResume'),adminController.apply_on_Job_fr )
         // Api for get applied JOb
          router.get('/getAppliedJob_fr/:jobId_fr', adminController.getAppliedJob_fr)
         // Api for Delete user Resume
         router.delete('/Delete_user_resume_fr/:apliedjobId_fr', adminController.Delete_user_resume_fr)

                          /* Blog Management in French */
           // APi for create Blog
           router.post('/createBlog_fr/:adminId' , upload.single('blogImage'),  adminController.createBlog_fr)
           // API for get all Blogs in french
           router.get('/getAllBlogs_fr', adminController.getAllBlogs_fr)
           // APi for get particular Blog Details in french
           router.get('/getBlog_fr/:blogId_fr', adminController.getBlog_fr)
           // Api for update Blog in french
           router.put('/updateBlog_fr/:blogId_fr',upload.single('blogImage') , adminController.updateBlog_fr)
           // Api for active and inactive Blog in french 
           router.post('/active_inactive_blog/:blogId_fr', adminController.active_inactive_blog)
           // APi for delete Blog
           router.delete('/deleteBlog_fr/:blogId_fr', adminController.deleteBlog_fr)

                          /* contact-us page in French */
           // APi for contact-us page
           router.post('/contact_us_fr', adminController.contact_us_fr)
           // APi for get all contact_fr
           router.get('/getAll_contact_fr', adminController.getAll_contact_fr)
           // Api for delete contact us details
           router.delete('/delete_contactPage_details_fr/:contact_id_fr', adminController.delete_contactPage_details_fr)


module.exports = router
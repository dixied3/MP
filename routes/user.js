const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const userController = require("../controllers/users.js") ; 



router
    .route("/signup")
   
    .get( userController.renderSignupForm)
    
    .post( wrapAsync(userController.signup));



router
    .route("/login")
   
    .get( userController.renderLoginForm)
    
    .post( saveRedirectUrl , 
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }) , 
        userController.login
    );  



router.get("/logout" , userController.logout) ; 

router
    .route("/reset")
    .get(userController.renderResetForm) 
    .post(wrapAsync(userController.reset)) ; 

router.route("/reset/:token")
    .get(wrapAsync(userController.renderNewPassForm))
    .post(wrapAsync(userController.setNewPass)) ; 


module.exports = router;

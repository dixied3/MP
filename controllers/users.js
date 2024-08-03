const User = require('../models/user.js');
const nodemailer = require("nodemailer") ; 
const crypto = require('crypto');


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
} ; 

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

        // after sign-up direct no login need 
        req.login(registeredUser , (err) => {
            if(err) {
                return next(err) ; 
            } 
             else {
                req.flash("success", "Welcome to Wanderlust");
                res.redirect("/listings");
             }
        } )

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
        next(e);
    }
} ; 

module.exports.renderLoginForm = (req, res) => {
    
    res.render("users/login.ejs");
} ; 

module.exports.login = async(req, res) => {
    req.flash("success", "Welcome back to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings" ; 
    res.redirect(redirectUrl);
} ; 

module.exports.logout = (req , res , next) => {
    req.logout((err) => {
        if(err) {
            return next(err) ; 
        }
            req.flash("success" , "Logged out successfully") ; 
            res.redirect("/listings") ; 
    
    })
} ; 

module.exports.renderResetForm = (req , res) => {
    res.render("users/reset.ejs");
} ; 


module.exports.reset = async (req, res) => {
    const { email } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
        req.flash("error", "No account with that email address exists.");
        return res.redirect("/reset");
    }

    // Generate a token
    const token = crypto.randomBytes(20).toString('hex');

    // Set the token and expiration on the user object
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    // Save the user object
    await user.save();

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    console.log(req.headers) ; 
    // Email options
    const mailOptions = {
        to: user.email,
        from: `"Wanderlust" <no-reply@wanderlust.com>` , 
        subject: 'Wanderlust Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
              `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
              `http://${req.headers.host}/reset/${token}\n\n` +
              `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    req.flash('success', 'An e-mail has been sent to your Gmail');
    res.redirect('/reset');
} ; 


module.exports.renderNewPassForm = async(req , res ) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/reset');
    }

    res.render('users/new-password.ejs', { token: req.params.token });
    
} ; 

module.exports.setNewPass = async(req , res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/reset');
    }

    if (req.body.password === req.body.confirm) {
        user.setPassword(req.body.password, async (err) => {
            if (err) {
                req.flash('error', 'Something went wrong!');
                return res.redirect('/reset');
            }

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            req.login(user, (err) => {
                req.flash('success', 'Your password has been reset successfully!');
                res.redirect('/listings');
            });
        });
    } else {
        req.flash('error', 'Passwords do not match.');
        res.redirect('back');
    }
    
} ; 
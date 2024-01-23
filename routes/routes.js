import express from "express";
import userModel from "./users.js"
import passport from "passport";
import localStrategy from 'passport-local';
import upload from "./multer.js";
import postModel from "./posts.js";

const router = express.Router();

passport.use(new localStrategy({ 
    usernameField: 'username', 
    passwordField: 'password'
}, async (credentials, password, done) => {
    try {
        const user = await userModel.findOne({ $or: [{ email: credentials }, { username: credentials }] });
        if (!user) { return done(null, false, { message: 'Invalid email or username or password.' }) }
        const result = await user.authenticate(password)
        const isAuthenticated = result.user
        if(!isAuthenticated) { return done(null, false, { message: 'Invalid password.' }) }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));


const isLoggedIn = (req, res, next) => {
    console.log('user logged in');
    if(req.isAuthenticated()) return next();
    console.log('Not Authenticated')
    res.redirect('/login')
}

router.get('/', async function(req, res) {
    if(isLoggedIn && req.session.passport) {
        const user = await userModel.findOne({
            $or: [
                { email: req.session.passport.user }, 
                { username: req.session.passport.user }
            ] })
        res.render('home', { user: user })
    } else {
        res.render('home', { user: null })
    }

})

router.get('/register', function(req, res) {
    res.render('register')
})

router.post('/register', function(req, res) {
    const user = new userModel({
        email: req.body.email,
        username: req.body.username,
        fullName: req.body.fullname,
    })

    console.log('registration begin.....');
    userModel.register(user, req.body.password, (err, user) => {
        if(err) {
            console.log(err, '<---------- registration error');
            return res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                console.log('authenticated');
                return res.redirect('/profile')
            })
        }
    })
})

router.get('/login', function(req, res) {
    res.render('login', { faliureMessage: req.flash('error') })
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/profile', isLoggedIn, async function(req, res) {
    const user = await userModel.findOne({
        $or: [
            { email: req.session.passport.user }, 
            { username: req.session.passport.user },
        ]
    })
    .populate('posts');
    
    res.render('profile', { 
        posts: user.posts, 
        pfp: user.profilePicture ,
        username: user.username,
        fullName: user.fullName,
        faliureMessage: req.flash('error'),
    })
})

router.post('/logout', function(req, res) {
    req.logOut(function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Account successfully logged out');
            res.redirect('/login')
        }
    })
})

router.post('/createpost', isLoggedIn, upload.single('post'), async function(req, res) {
    if(req.body.caption.trim() === '') {
        req.flash('error', 'No Caption provided')
        res.redirect('/profile')
    } else if(!req.file) {
        req.flash('error', 'No file provided')
        res.redirect('/profile')
    } else {
        const user = await userModel.findOne({
            $or: [
                { email: req.session.passport.user }, 
                { username: req.session.passport.user }
            ]
        });

        const post  = new postModel({
            image: req.file.path,
            caption: req.body.caption,
            user: user._id
        })

        user.posts.push(post._id);
        await post.save();
        await user.save();
        res.redirect('/profile')
    }
})

router.post('/uploaddp', isLoggedIn, upload.single('dp'), async (req, res) => {
    if(!req.file) {
        req.flash('error', 'No file provided');
        res.redirect('/profile')
    } else {
        const user = await userModel.findOne({
            $or: [
                { email: req.session.passport.user }, 
                { username: req.session.passport.user }
            ]
        });
        console.log(user.profilePicture)
        console.log(req.file.path.slice(7));
        user.profilePicture = '..\\' + req.file.path;
        await user.save()
        res.redirect('/profile')
    }
})

export default router;
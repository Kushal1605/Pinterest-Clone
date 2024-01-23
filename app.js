import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import flash from 'connect-flash'
import routes from './routes/routes.js'
import userModel from './routes/users.js'

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs");
app.use(flash());

app.use(session({
    secret: 'my pinterest app',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: false }   // true for https request because it sends cookkes on https requests only
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(userModel.serializeUser())
passport.deserializeUser(userModel.deserializeUser())

app.use(express.static('public'))
app.use('/', routes)

app.listen(port, () => {
console.log(`Live at localhost:${port}`)
})

export default app;

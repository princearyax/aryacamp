if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

console.log(process.env.secret);

const express = require("express");
const path = require("path");
const mongoose = require("mongoose"); //wrapAsync fun
const ExpressError = require("./utilities/expressError");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); //in info.txt
const session = require("express-session");
const MongoStore = require('connect-mongo'); //deploy things
const flash = require("connect-flash");
const passport = require("passport");
const authStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const sanitizeV5 = require('./utilities/mongoSanitizeV5.js');//security
// const mongoSanitize = require('express-mongo-sanitize');

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");


// const dbUrl = process.env.DB_URL;
const dbUrl =  "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("MongoDB connection opened successfully");
});

const app = express();
app.set('query parser', 'extended'); //security
const port = 3000;

app.engine("ejs", ejsMate);
// app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// console.log(path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//serving static files
app.use(express.static(path.join(__dirname,"public")));
//for session
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisShouldBeBetterInProduction!'
    }
});
store.on("error", function(e){
    console.log("Store error in main index", e);
})
const sessionConfig  = {
    store: store,
    name: "secere",
    secret : "thisShouldBeBetterInProduction",
    resave: false,
    saveUninitialized: true,
    //can specify store:mongo or somtn
    cookie : {
        httpOnly: true,
        // secure: true,
        expires: Date.now()+1000*60*60,//in ms
        maxAge: 1000*60*60
    }
};
app.use(session(sessionConfig));
//will be able to flash something with req.flash by passing in a key and a value
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnmguhtpt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize()); //must be used after app.use(session(...))
app.use(passport.session());
passport.use(new authStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use(sanitizeV5({ replaceWith: '_' }));//security
app.use((req, res, next)=>{
    res.locals.tempp = "popo"; //try for debug etc
    res.locals.currentUser = req.user;
    res.locals.saved=req.flash("saved");
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    //now we'll have access to this our template
    // console.log("session in middleware in index before any routes", req.session);
    console.log("query:   ",req.query);
    next();
});



app.get("/fakeUser", async (req, res) => {
    const user = new User({ email:"ok@gmail.com", username:"arya" });
    const newUser = await User.register(user, "lo");
    res.send(newUser);
})
//review


app.get("/", (req, res) => {
    res.render("home.ejs", { title: "Arya Camp" });
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.all(/.*/, (req, res, next) => {
    // res.status(404).send("Page not found");
    console.log("current url user is hitting: "+req.originalUrl);
    next(new ExpressError("Page not found this hits", 404));
});

app.use((err, req, res, next) => {
    // const { statusCode = 500, message = "Something..." } = err;
    const { statusCode = 500 } = err;
    if(!err.message) err.message = "Something went wrong"; 
    console.log("Error middleware started");
    console.log(err);
    console.log("Eroor middleware ended");
    res.status(statusCode).render("error", { err });
    // next(err);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
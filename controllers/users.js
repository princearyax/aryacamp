const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    if (res.locals.returnToMethod != "Get") return res.redirect("/campgrounds");
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged Out!');
        res.redirect('/campgrounds');
    });
};

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to yelpcamp");
            res.redirect("/campgrounds");
        });
        console.log(registerUser);
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};
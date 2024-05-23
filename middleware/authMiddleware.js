const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;
    console.log('The token is: ', token);
    // Check json web token exists & is verified
    if (token) {
        jwt.verify(token, 'net ninja secret', (err, decodedToken) => {
            if (err) {
                console.log("Inside error");
                res.redirect('/login');
                console.log(err.message);
            } else {
                console.log("inside else");
                console.log(decodedToken);
                next();
            }
        });
    } else {
        console.log("Inside main else");
        res.redirect('/login');
    }
}

// check current function
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    res.locals.user = null;
    if (token) {
        jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {
            if (err) {
                next();
                console.log(err.message);
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        next();
    }
}

module.exports = { requireAuth, checkUser}
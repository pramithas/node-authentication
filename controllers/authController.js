const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {

    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // incorrect email
    if (err.message === 'User with the given email not found.') {
        errors.email = 'that email is not registered'
    }

    // incorrect password
    if (err.message === 'Incorrect password') {
        errors.password = 'that password is incorrect'
    }


    //duplicate error code
    if (err.code === 11000) {
        errors.email = 'That email is already registered';
        return errors;
    }

    // Validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'net ninja secret', {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Signup:The email and password is: ", email, password);
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        console.log('Adding the id to the response: ', user._id);
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(500).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        console.log('The errors is ', err.message);
        res.status(500).json({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    // Replace with blank value and set expiry date to 1 ms.
    res.cookie('jwt', '', {maxAge: 1})
    res.redirect('/');
}
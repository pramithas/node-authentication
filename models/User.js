const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    }
});


userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    // this refers to user.
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// fire a function after doc is saved to db.
userSchema.post('save', function (doc, next) {
    console.log('The new user was created and saved', doc);
    next();
})


//static method to login user
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if(user) {
        const auth = await bcrypt.compare(password, user.password);
        if(auth){
            return user;
        }
        throw Error("Incorrect password");
    }
    throw Error('User with the given email not found.');
}

// Should be singular word of what we define in the collection.
const User = mongoose.model('user', userSchema);

module.exports = User;
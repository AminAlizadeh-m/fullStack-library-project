const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

authorSchema.pre('deleteOne', function (next) {

    Book.find({ author: this.getQuery()._id}, (error, books) => {
        if (error) {
            next(error);
        } else if (books.length > 0) {
            next(new Error('This author has book first remove books then you can remove author ...'));
        } else {
            next();
        }
    })    
})

module.exports = mongoose.model('Author', authorSchema);
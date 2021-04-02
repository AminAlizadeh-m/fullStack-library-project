const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// Get all authors
router.get('/', async (req, res) => {
    const searchOptions = {};
    if (req.query.name !== null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }

    try {
        const authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query.name
        });
    } catch (error) {
        res.redirect('/');
    }
});

// New author
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author()});
});

// Create new author
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    });

    try {
        const newAuthor = await author.save();
        res.redirect('authors');
    } catch (error) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        });
    }

});

// Show author info
router.get('/:id', async (req, res) => {
    try {
        const authorID = req.params.id;
        const author = await Author.findById(authorID);
        const booksByAuthor = await Book.find({author: authorID});
        
        res.render('authors/show', {author: author, booksByAuthor: booksByAuthor});
    } catch (error) {
        res.render('authors', {errorMessage: 'error, please try again ...'});
    }
});

// show edit auther
router.get('/:id/edit', async (req, res) => {
    const authorID = req.params.id;
    try {
        const author = await Author.findById(authorID);
        res.render('authors/edit', { author: author });
    } catch (error) {
        res.redirect('/authors');
    }
});

// Edit author
router.put('/:id', async (req, res) => {
    const authorID = req.params.id;
    try {
        const updatedAuthor = await Author.findByIdAndUpdate(authorID, {name: req.body.name}, { runValidators: true });
        res.redirect('/authors');
    } catch (error) {
        const author = await Author.findById(authorID);
        res.render(`authors/edit`, {errorMessage: 'Error updateing author, try again ...', author: author});
    }
})


// Delete auther
router.delete('/:id', async (req, res) => {
    const authorID = req.params.id;
    try {
        const deletedAuthor = await Author.deleteOne({_id: authorID}, {runValidators: true});
        res.redirect('/authors');
    } catch (error) {
        const author = await Author.findById(authorID);
        res.render(`authors/edit`, {errorMessage: error, author: author});
    }
});

module.exports = router;
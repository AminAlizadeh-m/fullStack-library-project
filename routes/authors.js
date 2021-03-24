const { query } = require('express');
const express = require('express');
const router = express.Router();
const Author = require('../models/author');

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
    res.render('authors/new');
});

// Create new author
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    });

    try {
        const newAuthor = await author.save();
        res.render('authors');
    } catch (error) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        });
    }

});

module.exports = router;
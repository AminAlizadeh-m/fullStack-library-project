const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Book = require('../models/book');
const Author = require('../models/author');

const uploadPath = path.join('public', Book.coverImageBasePath);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

function removeCover(filePath) {
    fs.unlink(filePath, err => {
        if (err) {
            console.error(err);
        }
    });
}

// Get All Books
router.get('/', async (req, res) => {

    let query = Book.find();
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    try {
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            serachOptions: req.query 
        })
    } catch (error) {
        res.redirect('/');
    }
});

// Get new book
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// Post new books
router.post('/', upload.single('coverImage'), async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.date),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImage: req.file.path
    });

    try {
        const newBook = await book.save();
        res.redirect('books')
    } catch (error) {
        removeCover(req.file.path);
        renderNewPage(res, book, true);
    }
});

// Get book info
router.get('/:id', async (req, res) => {
    const bookID = req.params.id;
    try {
        const book = await Book.findById(bookID).populate('author').exec();
        res.render('books/show', {book: book});
    } catch (error) {
        res.redirect('/');
    }
});

// Edit book
router.put('/:id/edit', async (req, res) => {
    res.send('update book (SOON:))')
})

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find();
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error creating book!'

        res.render(`books/${form}`, params);
        
    } catch (error) {
        res.redirect('/books');
    }
}

module.exports = router;
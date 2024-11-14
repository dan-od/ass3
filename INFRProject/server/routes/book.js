var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
// telling my router that I have this model
let Book = require('../model/book');
const book = require('../model/book');
let bookController = require('../controllers/book.js')
/* Get route for the book list - Read Operation */
/*
GET,
Post,
Put --> Edit/Update
*/
/* Read Operation --> Get route for displaying the books list */
router.get('/',async(req,res,next)=>{
try{
    const BookList = await Book.find();
    res.render('Book/list',{
        title:'Books',
        BookList:BookList
    })}
    catch(err){
        console.error(err);
        res.render('Book/list',{
            error:'Error on the server'
        })
    }
    });
/* Create Operation --> Get route for displaying me the Add Page */
router.get('/add',async(req,res,next)=>{
    try{
        res.render('Book/add',{
            title: 'Add Book'
        })
    }
    catch(err)
    {
        console.error(err);
        res.render('Book/list',{
            error:'Error on the server'
        })
    }
});
/* Create Operation --> Post route for processing the Add Page */
router.post('/add',async(req,res,next)=>{
    try{
        let newBook = Book({
            "Name":req.body.Name,
            "Author":req.body.Author,
            "Published":req.body.Published,
            "Description":req.body.Description,
            "Price":req.body.Price
        });
        Book.create(newBook).then(()=>{
            res.redirect('/bookslist');
        })
    }
    catch(err)
    {
        console.error(err);
        res.render('Book/list',{
            error:'Error on the server'
        })
    }
});
/* Update Operation --> Get route for displaying me the Edit Page */
router.get('/edit/:id',async(req,res,next)=>{
    try{
        const id = req.params.id;
        const bookToEdit= await Book.findById(id);
        res.render('Book/edit',
            {
                title:'Edit Book',
                Book:bookToEdit
            }
        )
    }
    catch(err)
    {
        console.error(err);
        next(err); // passing the error
    }
});
/* Update Operation --> Post route for processing the Edit Page */ 
router.post('/edit/:id',async(req,res,next)=>{
    try{
        let id=req.params.id;
        let updatedBook = Book({
            "_id":id,
            "Name":req.body.Name,
            "Author":req.body.Author,
            "Published":req.body.Published,
            "Description":req.body.Description,
            "Price":req.body.Price
        });
        Book.findByIdAndUpdate(id,updatedBook).then(()=>{
            res.redirect('/bookslist')
        })
    }
    catch(err){
        console.error(err);
        res.render('Book/list',{
            error:'Error on the server'
        })
    }
});
/* Delete Operation --> Get route to perform Delete Operation */
router.get('/delete/:id',async(req,res,next)=>{
    try{
        let id=req.params.id;
        Book.deleteOne({_id:id}).then(()=>{
            res.redirect('/bookslist')
        })
    }
    catch(error){
        console.error(err);
        res.render('Book/list',{
            error:'Error on the server'
        })
    }
});
module.exports = router;
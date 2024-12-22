const express = require("express");
const bodyParser = require("body-parser");
const Book = require('./models/book');
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/bookstore")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

  app.post('/books', async (req, res) => {
    try {
      const book = new Book(req.body);
      await book.save();
      res.status(201).json(book);
    } catch (err) {
      res.status(400).send(err.message);
    }
  });

  app.get('/books', async (req, res) => {
    try {
      const books = await Book.find();
      res.json(books);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.get('/books/:id', async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).send('Book not found');
      res.json(book);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.put('/books/:id', async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!book) return res.status(404).send('Book not found');
      res.json(book);
    } catch (err) {
      res.status(400).send(err.message);
    }
  });

  app.delete('/books/:id', async (req, res) => {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (!book) return res.status(404).send('Book not found');
      res.status(204).send();
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  
  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

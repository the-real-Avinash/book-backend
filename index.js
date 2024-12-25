const express = require("express");
const bodyParser = require("body-parser");
const Book = require('./models/book');
const User = require("./models/users");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); 

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/bookstore")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).send("Access denied. No token provided.");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token.");
    req.user = user; // Attach user information to the request
    next();
  });
};

// Authentication Endpoints
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send("User already exists.");
    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).send("User registered successfully.");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user and validate password
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials.");

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

  app.post('/books',authenticateToken, async (req, res) => {
    try {
      const book = new Book(req.body);
      await book.save();
      res.status(201).json(book);
    } catch (err) {
      res.status(400).send(err.message);
    }
  });

  app.get('/books',authenticateToken, async (req, res) => {
    try {
      const books = await Book.find();
      res.json(books);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.get('/books/:id',authenticateToken, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).send('Book not found');
      res.json(book);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.put('/books/:id',authenticateToken, async (req, res) => {
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

  app.delete('/books/:id',authenticateToken, async (req, res) => {
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

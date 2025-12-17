const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }

  return res.status(404).json({ message: "Book not found" });
 });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  let result = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) {
      result.push({
        isbn: isbn,
        author: books[isbn].author,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: "No books found for this author" });
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let result = [];

  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      result.push(books[key]);
    }
  });

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(404).json({ message: "No books found with this title" });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "No reviews found for this book" });
});

// ============================
// TASK 10: Get all books using async/await + Axios
// ============================
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// ============================
// TASK 11: Get book by ISBN using async/await
// ============================
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = await new Promise((resolve, reject) => {
      books[isbn] ? resolve(books[isbn]) : reject();
    });
    return res.status(200).json(book);
  } catch {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ============================
// TASK 12: Get books by Author using async/await
// ============================
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();

  try {
    const result = await new Promise((resolve) => {
      const filtered = Object.values(books).filter(
        book => book.author.toLowerCase() === author
      );
      resolve(filtered);
    });

    if (result.length === 0)
      return res.status(404).json({ message: "No books found for this author" });

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// ============================
// TASK 13: Get books by Title using async/await
// ============================
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();

  try {
    const result = await new Promise((resolve) => {
      const filtered = Object.values(books).filter(
        book => book.title.toLowerCase() === title
      );
      resolve(filtered);
    });

    if (result.length === 0)
      return res.status(404).json({ message: "No books found with this title" });

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ message: "Error fetching books" });
  }
});


module.exports.general = public_users;

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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
public_users.get('/', async (req, res) => {
  try {
    const allBooks = await new Promise((resolve) => {
      resolve(books);
    });
    return res.status(200).json(allBooks);
  } catch {
    return res.status(500).json({ message: "Error fetching books" });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = await new Promise((resolve, reject) => {
      books[isbn] ? resolve({ isbn, ...books[isbn] }) : reject();
    });
    return res.status(200).json(book);
  } catch {
    return res.status(404).json({ message: "Book not found" });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();

  try {
    const result = await new Promise((resolve) => {
      const filtered = Object.keys(books)
        .filter(key => books[key].author.toLowerCase() === author)
        .map(key => ({ isbn: key, ...books[key] }));
      resolve(filtered);
    });

    if (result.length === 0)
      return res.status(404).json({ message: "No books found for this author" });

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ message: "Error fetching books" });
  }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();

  try {
    const result = await new Promise((resolve) => {
      const filtered = Object.keys(books)
        .filter(key => books[key].title.toLowerCase() === title)
        .map(key => ({ isbn: key, ...books[key] }));
      resolve(filtered);
    });

    if (result.length === 0)
      return res.status(404).json({ message: "No books found with this title" });

    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ message: "Error fetching books" });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "No reviews found for this book" });
});


module.exports.general = public_users;

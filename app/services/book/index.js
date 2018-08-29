const Book = require('./BookClass');

class BCBookService {
  constructor () {
    this.Book = Book;
  }
}

module.exports = BCBookService;

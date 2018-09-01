const fetch = require("node-fetch");
const Book = require('./BookClass');

const $Events = use('EventService');
const $DB = use('DBService');
const $User = use('UserService');

class BookService {
  constructor () {
    this.Book = Book;
    $Events.on('db.connect', () => {
      this.collection = $DB.collection('books');
    })
  }

  /**
   * Find books in the collection with specific query.
   *
   * @param {*} params
   * @returns {array} Array of founded books
   * @memberof BookService
   */
  async findBooks(params) {
    try {
      return await (await this.collection.find(params)).toArray();
    } catch (e) {
      throw e;
    }
  }

  /**
   * Find one book in the collection with specific query.
   *
   * @param {*} params
   * @returns {Book|null} Found book or null
   * @memberof BookService
   */
  async findBook(params) {
    try {
      let found = await this.findBooks(params);
      return found.length ? found : null;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Claim a book from owner.
   *
   * @param {string} token Auth token
   * @param {*} uid Book uid
   * @param {*} owner Username
   * @returns {boolean}
   * @memberof BookService
   */
  async claim(token, uid, owner) {
    try {
      let user = await $User.getUserFromToken(token);

      if (user) {
        let updateResult = await this.collection.updateOne({ uid }, { $addToSet: { claimedBy: { owner, claimer: user.username } } });
        return !!updateResult.result.n
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Find a book from google books API.
   *
   * @param {string} q Query
   * @returns {array} List of found books
   * @memberof BookService
   */
  async vendorFind(q) {
    try {
      let response = await fetch(`https://www.googleapis.com/books/v1/volumes?printType=books&q=${q}&projection=lite&maxResults=25`);
      const data = await response.json();
      return data.items || [];
    } catch (e) {
      throw e;
    }
  }

  /**
   * Assign a book to a user.
   *
   * @param {*} uid Book uid
   * @param {string} token Auth token
   * @returns {string|boolean} Username or false
   * @memberof BookService
   */
  async assignToUser(uid, token) {
    try {
      let foundUser = await $User.getUserFromToken(token);

      if (foundUser) {
        await this.collection.updateOne({ uid }, { $addToSet: { ownedBy: foundUser.username } });

        return foundUser.username;
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Add a new book to DB.
   *
   * @param {Book} newBook
   * @param {string} token Auth token
   * @returns {Book} Added book
   * @memberof BookService
   */
  async add(newBook, token) {
    try {
      if (!newBook.info.uid) {
        return false;
      }

      let foundBook = await this.findBook({ uid: newBook.info.uid });

      if (foundBook) {
        let username = await this.assignToUser(newBook.info.uid, token);

        if (!~newBook.info.ownedBy.indexOf(username)) {
          newBook.info.ownedBy.push(username);
        }

        return newBook;
      } else {
        newBook.info.registeredAt = new Date().getTime();
        let insertionResult = await this.collection.insertOne(newBook.info);

        if (newBook.info.uid && insertionResult.result.ok) {
          let username = await this.assignToUser(newBook.info.uid, token);

          if (!~newBook.info.ownedBy.indexOf(username)) {
            newBook.info.ownedBy.push(username);
          }

          return newBook;
        } else {
          return false
        }
      }
    } catch (e) {
      throw e;
    }
  }
}

module.exports = BookService;

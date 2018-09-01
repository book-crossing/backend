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
   * Find books in the collection with specific query
   *
   * @param {*} params
   * @returns {array} Array of founded books
   * @memberof BookService
   */
  async findBooks(params) {
    try {
      return await (await this.collection.find(params)).toArray();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Find one book in the collection with specific query
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
      console.error(e);
      throw e;
    }
  }

  async vendorFind(q) {
    try {
      let response = await fetch(`https://www.googleapis.com/books/v1/volumes?printType=books&q=${q}&projection=lite&maxResults=25`);
      const data = await response.json();
      return data.items || [];
    } catch (e) {
      throw e;
    }
  }

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

  async add(newBook, token) {
    try {
      if (!newBook.info.uid) {
        return false;
      }

      // TODO

      let foundBook = await this.findBook({ uid: newBook.info.uid });

      if (foundBook) {
        let username = await this.assignToUser(newBook.info.uid, token);
        // newBook.info.ownedBy.push(username);
        return newBook;
      } else {
        newBook.info.registeredAt = Math.ceil(new Date().getTime() / 1000);
        let insertionResult = await this.collection.insertOne(newBook.info);

        if (newBook.info.uid && insertionResult.result.ok) {
          let username = await this.assignToUser(newBook.info.uid, token);
          // newBook.info.ownedBy.push(username);
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

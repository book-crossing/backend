const $DB = use('DBService');
const $Response = use('ResponseService');
const $Book = use('BookService');

class BookController {
  async add (params) {
    try {
      let foundBooks = await $Book.vendorFind(params.body.id);
      let bookData = foundBooks[0];
      let newBook = new $Book.Book({ comment: params.body.comment || '' }).parse(bookData);
      let book = await $Book.add(newBook, params.token);
      return $Response.message({ book });
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to add a new book. ' + e.message);
    }
  }
}

namespace('App/Controller/BookController', BookController);

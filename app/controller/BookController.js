const $DB = use('DBService');
const $Response = use('ResponseService');
const BookService = use('BookService');

class BookController {
  test (params) {
    let newBook = new BookService.Book().parse(params.body.book);
    return newBook;
  }
}

namespace('App/Controller/BookController', BookController);

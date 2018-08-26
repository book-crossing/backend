const DBClient = use('DBClient');
const BCResponse = use('BCResponse');
const BCBookService = use('BCBookService');

class BookController {
  test (params) {
    let newBook = new BCBookService.Book().parse(params.body.book);
    return newBook;
  }
}

namespace('App/Controller/BookController', BookController);

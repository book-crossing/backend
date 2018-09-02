const $DB = use('DBService');
const $Response = use('ResponseService');
const $Book = use('BookService');
const $User = use('UserService');
const $Misc = use('MiscService');
const $Config = use('Config');

/**
 * Controller for handling book specific requests.
 *
 * @class BookController
 */
class BookController {

  /**
   * Add new book.
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof BookController
   */
  async add(params) {
    if (!params.body.id) {
      return $Response.buildFromError(4002);
    }

    try {
      let foundBooks = await $Book.vendorFind(params.body.id);
      let bookData = foundBooks[0];
      let newBook = (new $Book.Book({ comment: params.body.comment || '' })).parse(bookData);
      let book = await $Book.add(newBook, params.token);
      return $Response.payload(book);
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to add a new vendor book. ' + e.message);
    }
  }

  /**
   * Add new custom book.
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof BookController
   */
  async addCustom(params) {
    if (!params.body.info) {
      return $Response.buildFromError(4004);
    }

    try {
      let uid = $Misc.sha512(JSON.stringify(params.body.info), $Config.get('app.salt'));
      let newBook = (new $Book.Book({ uid, comment: params.body.comment || '' })).parse(params.body.info);
      let book = await $Book.add(newBook, params.token);
      return $Response.payload(book);
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to add a new custom book. ' + e.message);
    }
  }

  /**
   * Get list of books.
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof BookController
   */
  async list(params) {
    try {
      let list = await $Book.findBooks({ isActive: true });
      return $Response.payload(list);
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to get a list of books. ' + e.message);
    }
  }

  /**
   * Claim a book from owner.
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof BookController
   */
  async claim(params) {
    if (!params.body.owner) {
      return $Response.buildFromError(4003);
    }

    if (!params.body.uid) {
      return $Response.buildFromError(4002);
    }

    try {
      let user = await $User.findUser({ username: params.body.owner });

      if (user) {
        let isClaimed = await $Book.claim(params.token, params.body.uid, params.body.owner);

        if (isClaimed) {
          return $Response.payload({
            phone: user.info.phone,
            name: user.info.name
          });
        } else {
          return $Response.buildFromError(4001);
        }
      } else {
        return $Response.buildFromError(4000);
      }
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to claim a book. ' + e.message);
    }
  }

  // TODO
  async confirmBorrow(params) {
    try {
      return $Response.buildFromError(404);
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to confirm a borrow. ' + e.message);
    }
  }
}

namespace('App/Controller/BookController', BookController);

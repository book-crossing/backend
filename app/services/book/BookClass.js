const defaultValues = {
  isActive: true,
  tookCount: 0,
  ownedBy: [],
  claimedBy: [],
  comment: null,
  queue: []
}

const ParserConfig = {
  uid: 'id',
  authors: 'volumeInfo.authors',
  title: 'volumeInfo.title',
  cover: 'volumeInfo.imageLinks',
  description: 'volumeInfo.description',
  publishedAt: 'volumeInfo.publishedDate'
}

class Book {
  constructor (info = {}) {
    this.info = { ...defaultValues, ...info };
  }

  /**
   * Parse data for a new book.
   *
   * @param {*} [bookFromAPI={}]
   * @returns Book
   * @memberof Book
   */
  parse (bookFromAPI = {}) {
    Object.keys(ParserConfig).forEach(key => {
      if (typeof ParserConfig[key] === 'string') {
        if (ParserConfig[key][0] !== '=') {
          this.info[key] = ParserConfig[key].split('.').reduce((o, i) => (o === Object(o) ? o[i] : o), bookFromAPI);
        } else {
          this.info[key] = ParserConfig[key].replace('=', '');
        }
      } else {
        this.info[key] = ParserConfig[key]
      }
    })
    return this;
  }
}

module.exports = Book;

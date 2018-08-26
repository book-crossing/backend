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
    this.info = info;
  }

  parse (bookFromAPI) {
    Object.keys(ParserConfig).forEach(key => {
      this.info[key] = ParserConfig[key].split('.').reduce((o, i) => (o === Object(o) ? o[i] : o), bookFromAPI);
    })
    return this;
  }
}

module.exports = Book;

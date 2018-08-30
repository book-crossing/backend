require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

const $Events = use('EventService');

const url = env('DB_CONNECTION_URL', null);
const dbName = 'bookcrossing';

class DBCollection {
  constructor(collection) {
    this.currentCollection = collection;
    this.wrapAll();
  }

  wrapAll() {
    Object.getOwnPropertyNames(this.currentCollection.__proto__).forEach(el => {
      if (el !== 'constructor' && typeof this.currentCollection[el] === 'function') {
        this[el] = async (...params) => {
          try {
            let result = await this.wrap(el, ...params);
            return result;
          } catch (e) {
            console.error(e);
          }
        }
      }
    })
  }

  async wrap(method, ...params) {
    try {
      if (this.currentCollection[method]) {
        return await this.currentCollection[method](...params);
      } else {
        console.log(`No such method ${method}`);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

class DBClient {
  constructor() {
    this.isConnected = false;
    if (url) {
      MongoClient.connect(url, (err, client) => {
        if (err == null) {
          this.isConnected = true;
          console.log("Connected successfully to MDB server");
          this.db = client.db(dbName);
          $Events.emit('db.connect');
        } else {
          console.error(err);
        }
      });
    } else {
      console.error('Database connection url is not set');
    }
  }

  collection(collectionName) {
    if (this.isConnected) {
      let collection = this.db.collection(collectionName);
      return new DBCollection(collection);
    } else {
      return null
    }
  }
}

module.exports = DBClient;

let DBClient = require('.');

singleton('DBService', () => new DBClient());

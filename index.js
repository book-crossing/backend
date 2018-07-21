const Server = require('ivy-js');
require('./bootstrap');
(new Server).start((port, host) => {
  console.log('started on', `http://${host}:${port}`)
});

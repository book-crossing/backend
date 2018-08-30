const Route = use('Router');

/**
 * List of routes
 */
// Route.get('/', 'HomeController@home');
// Route.get('/test', parameter => 'poop');
// Route.get('/test/:id', (parameter) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve(parameter)
//         }, 1000);
//     })
// });

/**
 * Alternative routes by Raiondesu
 */

const routes = (route) => ({
  'api': {
    'user': {
      'register': route('POST', 'UserController@register', { middleware: ['check-db', 'body-parser'] }),
      'login': route('POST', 'UserController@login', { middleware: ['check-db', 'body-parser'] }),
      'logout': route('POST', 'UserController@logout', { middleware: ['check-db', 'check-token'] }),
      ':username': {
        '/': route('GET', 'UserController@index', { middleware: ['check-db'] })
      }
    },
    'book': {
      'add': route('POST', 'BookController@add', { middleware: ['check-db', 'check-token'] })
    }
  }
})

Route.registerRoutes(routes)

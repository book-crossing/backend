const EventManager = require('js-simple-events').default;

singleton('EventService', () => new EventManager());

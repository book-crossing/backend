require('./bootstrap');

let Console = use('Ivy/Commander');
let args = process.argv.slice(2);

if (!Console.run(args)) {
  Console.run(['help']);
}


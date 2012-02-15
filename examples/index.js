// This will automatically override calls to the internal console object
var restoreConsole = require("konsole/overrideConsole");

// You can restore the old console object afterwards.
// After calling console calls will not emit any event - console will work just as normal.
//restoreConsole();

// you can also create multiple konsoles with a different labels
// We want to relay events from this konsole to our "main" console object
// so we add it to the relay call.
var Konsole = require("konsole");
var konsole = new Konsole("MyLabel");

console.addDefaultListener();

// console got overriden from konsole.
// You can use console just as you used it before
console.time("foo");

var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

// Lets assume that socketio, express or any other library were using konsole.
// To get all logs from those modules we would just relay those konsole events
// You can relay as many konsole objects as you like.
console.relay(socketio.konsole, express.konsole);


// you can create as many konsole instances as you like.
konsole.log("i will get the label 'MyLabel'");


// bar module itself does not export a konsole object, but uses
// console.* directly. If you let Konsole override console it will catch all calls and will emit an event instead.
var bar = require("bar");


console.log("This log message gets not written to stdout"); // This will emit a 'message' event and a 'log' event.
console.info("Instead it emits an event on which you can listen with additional information"); // This will emit a 'message' event and a 'info' event.

function doSomething() {
    console.info("I did something");
}
// Just for demonstrating
setInterval(doSomething, 4200);


// This is not really express and socketio.
// Just for demonstration, we mock those modules
var app = express.createServer();
var io = socketio.listen(app);


foo.doSomething();

console.timeEnd("foo");

// This will emit a 'message' event and a 'info' event relayed to  console object.
console.log("process.versions: ", process.versions);

foo.doSomethingElse();
console.warn("Warning");


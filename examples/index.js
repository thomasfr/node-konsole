var Konsole = require("konsole");

// We could switch trace and diff to off. By default this is enabled
// Switch it off in production and it will never generate those.
// and a diff in ms to the latest console call with the same label.
// If you call restoreConsole it will restore the original console object
var restoreConsole = Konsole({trace:true, diff:true});

// console got overriden from konsole. You can use console just as you used it before
console.time("foo");

var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

setInterval(doSomething, 4200);

// Without registering any listener to console, nothing will ever be written to stdout or elsewhere. Its completly up to you
// to handle console events
console.on("message", function (level, label, args, pid, pType, trace, diff) {
    this.write(" " + label + " " + pType + ":" + pid + "\t" + level.toUpperCase() + "\t" + (diff !== null ? "+" + diff + "ms " : "" ) + (trace.path ? "(" + trace.path : "") + (trace.line ? ":" + trace.line + ") " : "") + "'" + this.format.apply(this, args) + "'");
});


// you can also create multiple konsoles with a different label.
// We want to relay events from this konsole to our "main" console object
// so we add it to the relay call.
var konsole = Konsole("konsole");

// Lets assume that socketio, express or any other library are using konsole.
// To get all logs from those modules we would just relay those konsole events
// You can add as many konsole objects as you like.
console.relay(socketio.konsole, express.konsole, konsole);

// bar module itself does not export a konsole object, but uses
// console.* directly. If you let Konsole override console it will
//  catch all logs and it will trigger a message event instead of writing to stdout.
var bar = require("bar");

konsole.log("konsole");

console.log("This log message gets not written to stdout"); // This will emit a 'message' event and a 'log' event.
console.info("Instead it emits an event on which you can listen with additional information"); // This will emit a 'message' event and a 'info' event.
function doSomething() {
    konsole.info("I did something");
}


// This is not really express and socketio.
// Just for demonstration
var app = express.createServer();
var io = socketio.listen(app);
foo.doSomething();

console.timeEnd("foo");

// This will emit a 'message' event and a 'info' event relayed to  console object.
konsole.info("info from another konsole with a different label");
console.log("process.versions: ", process.versions);

// You can restore the old console object. Since then everything works just
// before and does not emit an event anymore.
//restoreConsole();

foo.doSomethingElse();
console.warn("Warning");


var Konsole = require("konsole");
var restoreConsole = Konsole({trace:true, diff:true});

// Since now console got overriden from konsole. You can use console just as you did before.
console.time("foo");

var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

setInterval(doSomething, 4200);

// Without registering any listener to console, nothing will ever be written to stdout or elsewhere. Its completly up to you
console.on("message", function (level, label, args, pid, pType, trace, diff) {
    this.write(" " + label + " " + pType + ":" + pid + "\t" + level.toUpperCase() + "\t" + (diff !== null ? "+" + diff + "ms " : "" ) + (trace.path ? "(" + trace.path : "") + (trace.line ? ":" + trace.line + ") " : "") + "'" + this.format.apply(this, args) + "'");
});

var bar = require("bar");

// you can also create multiple konsoles with a different label.
var konsole = Konsole("konsole");


// Lets assume that socketio, express or any other library are using konsole.
// To get all logs from those modules we would just relay those konsole events
// We can do this just with:
console.relay(socketio.konsole, express.konsole, konsole);
konsole.log("konsole");

console.log("This log message gets not written to stdout"); // It will emit a 'message' event and a 'log' event.
console.info("Instead it emits an event on which you can listen with additional information"); // It will emit a 'message' event and a 'info' event.
function doSomething() {
    konsole.info("I did something");
}


// This is not really express and socketio.
// Just for demonstration
var app = express.createServer();
var io = socketio.listen(app);
foo.doSomething();

console.timeEnd("foo");

konsole.info("info from another konsole with a different label"); // It will emit a 'message' event and a 'info' event relayer on the konsole object.
console.log("process.versions: ", process.versions);

// You can restore the old console object. Since now everything works just
// before and does not emit an event
//restoreConsole();

foo.doSomethingElse();
console.warn("Warning");


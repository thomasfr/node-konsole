var util = require("util");
var Konsole = require("konsole");
var restoreConsole = Konsole(true, {trace:true});
/*
 var socketio = require("socketio");
 var express = require("express");
 var foo = require("foo");
 */

// Change the label for this konsole
//konsole.label = "example:k1";

// NOTE: If no Listener was defined when the first event gets emitted, konsole registers its default listener by itself
console.on("message", function (level, label, args, pid, pType, trace) {
    this.write("MY Log Handler [module: " + label + "] [" + pType + ":" + pid + "] " + level.toUpperCase() + " " + trace.path + ":" + trace.line + " '" + util.format.apply(this, args) + "'");
});

var bar = require("bar");

// you can also create multiple konsoles with a different label.
var konsole2 = Konsole("konsole");

// Lets assume that socketio, express or any other library are using konsole.
// To get all logs from those modules we would just relay those konsole events
// We can do this just with:
//konsole.relay(socketio.konsole, express.konsole, foo.konsole, konsole2);
//console.relay(konsole2);

console.log("This log message gets not written to stdout"); // It will emit a 'data' event and a 'log' event.
console.info("Instead it emits an event on which you can listen with additional information"); // It will emit a 'data' event and a 'info' event.
/*
 // This is not really express and socketio.
 // Just for demonstration
 var app = express.createServer();
 var io = socketio.listen(app);
 foo.doSomething();
 */

konsole2.info("info from konsole2"); // It will emit a 'data' event and a 'info' event relayer on the konsole object.
//foo.doSomethingElse();
console.warn("Warning"); // It will emit a 'data' event and a 'warn' event.
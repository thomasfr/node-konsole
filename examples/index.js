var util = require("util");
var konsole = exports.konsole = require("konsole").create("konsole-example");
var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

// Change the label for this konsole
konsole.label = "example:k1";

// Register a event handler for all logs, regardless of the level.
// You could also register the default Handler by calling:
//konsole.registerDefaultListener();
//
// NOTE: If no Listener was defined when the first event gets emitted, konsole registers its default listener by itself
konsole.on("data", function (level, label, file, line, char, args) {
    this.out("MY Log Handler [module: " + label + "] " + level.toUpperCase() + " " + file + ":" + line + " '" + util.format.apply(this, args) + "'");
});



// you can also create multiple konsoles with a different label.
var konsole2 = konsole.create("example:k2");

// Lets assume that socketio, express or any other library are using konsole.
// To get all logs from those modules we would just relay those konsole events
// We can do this just with:
konsole.relay(socketio.konsole, express.konsole, foo.konsole, konsole2);

konsole.log("This log message gets not written to stdout"); // It will emit a 'data' event and a 'log' event.
konsole.info("Instead it emits an event on which you can listen with additional information"); // It will emit a 'data' event and a 'info' event.

// This is not really express and socketio.
// Just for demonstration
var app = express.createServer();
var io = socketio.listen(app);
foo.doSomething();

konsole2.info("info from konsole2"); // It will emit a 'data' event and a 'info' event relayer on the konsole object.
foo.doSomethingElse();
konsole.warn("Warning"); // It will emit a 'data' event and a 'warn' event.
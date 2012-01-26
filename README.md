# EventEmitter powered console implementation

konsole and console APIs are identical. So you can easily replace all your `console.log`, `console.warn`, `console.info` and `console.err` and every other `console` method call with a konsole call.

## Usage

```JavaScript

var util = require("util");
var Konsole = require("konsole");
var konsole = new Konsole("my-module-name");
var socketio = require("socket.io");
var fancyNPMModule = require("node-fancy-module");

// Register a event handler for all logs, regardless of the level.
// konsole.registerDefaultHandler(); would do exactly the same:
konsole.on("data", function(level, label, file, line, char, args) {
    this.out("[" + label + "] [" + level.toUpperCase() + "] (" + file + ":" + line + ":"+char+") " + util.format.apply(this, args));
});

// Lets assume your app or library module depends on the two userland modules
// 'socket.io' and 'fancyNPMModule'. If they export their konsole we can relay their
// logging events to our konsole instance.
konsole.relayEvents(socketio.konsole);
konsole.relayEvents(fancyNPMModule.konsole);



konsole.on("error", function(label, file, line, char, args) {
    process.exit(1);
});


konsole.log("This log message gets not written to stdout"); // It will emit a 'data' event and a 'log' event.
konsole.error("This error message gets not written to stderr"); // It will emit a 'data' event and a 'error' event.


```
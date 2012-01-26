# EventEmitter powered console implementation

konsole and console APIs are identical. So you can easily replace all your `console.log`, `console.warn`, `console.info` and `console.err` and every other `console` method call with a konsole call.

## Usage

```JavaScript

var util = require("util");
var Konsole = require("konsole");
var konsole = new Konsole("my-module-name");

konsole.on("data", function(level, label, file, line, args) {
    this.out("[" + label + "] [" + level.toUpperCase() + "] (" + path + ":" + line + ") " + util.format.apply(this, args));
});


konsole.on("error", function(label, file, line, args) {
    process.exit(1);
});


konsole.log("This will not write to stdout"); // It will emit a 'data' event and a 'log' event.
konsole.error("This will not write to stdout"); // It will emit a 'data' event and a 'error' event.


```
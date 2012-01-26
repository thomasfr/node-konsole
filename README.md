# EventEmitter powered console implementation

konsole and console APIs are identical. So you can easily replace all your `console.log`, `console.warn`, `console.info` and `console.err` and every other `console` method call with a konsole call.

## Usage

    npm install konsole

```JavaScript

var util = require("util");
var konsole = exports.konsole = require("konsole").create("konsole-example");
var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

// Change the label for this konsole
konsole.label = "example:k1";

// Register a event handler for all logs, regardless of the level.
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

konsole2.info("info from konsole2"); // It will emit a 'data' event and a 'info' event relayer on the konsole object.
konsole.warn("Warning"); // It will emit a 'data' event and a 'warn' event.


```

## License

Konsole is released under the MIT license.

Copyright (c) 2012 Thomas Fritz

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
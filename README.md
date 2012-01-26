# EventEmitter powered console implementation

konsole and console APIs are identical. So you can easily replace all your `console.log`, `console.warn`, `console.info` and `console.err` and every other `console` method call with a konsole call.

## Usage

### Installation

    npm install konsole


### Example usage

```JavaScript

var util = require("util");
var konsole = exports.konsole = require("konsole").create("konsole-example");
var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

// Change the label for this konsole
konsole.label = "example:k1";

// Register a event handler for all logs, regardless of the level.
// the data event callback will get the following arguments:
// level: log|info|warn|error
// label: the given label or an empty string
// file: the full path to the file where konsole log were called
// line: the line number where konsole log were called
// char: the char number of the konsole log call
// args: an array of arguments passed to the originated konsole call
// @scope: konsole
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


### Example above will output

```
MY Log Handler [module: example:k1] LOG /home/thomas/programming/konsole/examples/index.js:29 'This log message gets not written to stdout'
MY Log Handler [module: example:k1] INFO /home/thomas/programming/konsole/examples/index.js:30 'Instead it emits an event on which you can listen with additional information'
MY Log Handler [module: express] INFO /home/thomas/programming/konsole/examples/node_modules/express/index.js:4 'listening on 3000 in development mode'
MY Log Handler [module: socketio] INFO /home/thomas/programming/konsole/examples/node_modules/socketio/index.js:4 'Socket.IO started'
MY Log Handler [module: foo] LOG /home/thomas/programming/konsole/examples/node_modules/foo/index.js:4 'I am doing something'
MY Log Handler [module: example:k2] INFO /home/thomas/programming/konsole/examples/index.js:38 'info from konsole2'
MY Log Handler [module: foo] WARN /home/thomas/programming/konsole/examples/node_modules/foo/index.js:8 'Nooooo!'
MY Log Handler [module: example:k1] WARN /home/thomas/programming/konsole/examples/index.js:40 'Warning'
```

### Default Listener will output

```
[example:k1] [LOG] (/home/thomas/Projekte/Privat/konsole/examples/index.js:29:9) This log message gets not written to stdout
[example:k1] [INFO] (/home/thomas/Projekte/Privat/konsole/examples/index.js:30:9) Instead it emits an event on which you can listen with additional information
[express] [INFO] (/home/thomas/Projekte/Privat/konsole/examples/node_modules/express/index.js:4:13) listening on 3000 in development mode
[socketio] [INFO] (/home/thomas/Projekte/Privat/konsole/examples/node_modules/socketio/index.js:4:13) Socket.IO started
[foo] [LOG] (/home/thomas/Projekte/Privat/konsole/examples/node_modules/foo/index.js:4:13) I am doing something
[example:k2] [INFO] (/home/thomas/Projekte/Privat/konsole/examples/index.js:38:10) info from konsole2
[foo] [WARN] (/home/thomas/Projekte/Privat/konsole/examples/node_modules/foo/index.js:8:13) Nooooo!
[example:k1] [WARN] (/home/thomas/Projekte/Privat/konsole/examples/index.js:40:9) Warning
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
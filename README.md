# EventEmitter powered console implementation

konsole and console APIs are identical. So you can easily replace all your `console.log`, `console.warn`, `console.info` and `console.err` and every other `console` method call with a konsole call.
Since version 2.0.0 konsole overrides the console calls. So you do not have to replace your console calls. You will just have to `require("konsole")();` and all your console calls are kept back from written to stdout and konsole will emit instead a `message`event.

## Usage

### Installation

    npm install konsole


### Example usage

#### Dummy Example (node examples/index.js)

```JavaScript

var Konsole = require("konsole");
var restoreConsole = Konsole({trace:false, diff:false});

// Since now console got overriden from konsole. You can use console just as you did before.
console.time("foo");

var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

setInterval(doSomething, 4200);

// Without registering any listener to console, nothing will ever be written to stdout or elsewhere. Its completly up to you
// The callbacks scope is konsole, so you have access to utility functions like write (process.stdout.write) and format (util.format)
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

```

#### Cluster example from node.js docs (node examples/cluster.js)

```javascript
var restoreConsole = require("konsole")();
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

// Without registering any listener to console, nothing will ever be written to stdout or elsewhere. Its completly up to you
console.on("message", function (level, label, args, pid, pType, trace, diff) {
    this.write(" " + label + " " + pType + ":" + pid + "\t" + level.toUpperCase() + "\t" + (diff !== null ? "+" + diff + "ms " : "" ) + (trace.path ? "(" + trace.path : "") + (trace.line ? ":" + trace.line + ") " : "") + "'" + this.format.apply(this, args) + "'");
});

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('death', function (worker) {
        console.log('died');
    });
    console.log("Listening on http://127.0.0.1:8000");
} else {
    // Worker processes have a http server.
    http.Server(
        function (req, res) {
            console.log("Request: ", req.url);
            res.writeHead(200);
            res.end("hello world\n");
        }).listen(8000);
    console.log("Worker online");
}
```

### Example above will output

```
$ node examples/index.js
 console master:5654    LOG     +0ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/bar/index.js:1) 'Ich bin bar'
 konsole master:5654    LOG     +0ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:28) 'konsole'
 console master:5654    LOG     +8ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:30) 'This log message gets not written to stdout'
 console master:5654    INFO    +1ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:31) 'Instead it emits an event on which you can listen with additional information'
 express master:5654    INFO    +0ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/express/index.js:4) 'listening on 3000 in development mode'
 socketio master:5654   INFO    +0ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/socketio/index.js:4) 'Socket.IO started'
 console master:5654    LOG     +2ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/foo/index.js:4) 'I am doing something'
 console master:5654    LOG     +0ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:43) 'foo: 17ms'
 konsole master:5654    INFO    +3ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:45) 'info from another konsole with a different label'
 console master:5654    LOG     +1ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:46) 'process.versions:  { node: '0.6.8',
  v8: '3.6.6.19',
  ares: '1.7.5-DEV',
  uv: '0.6',
  openssl: '0.9.8o' }'
 console master:5654    WARN    +1ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/foo/index.js:8) 'Nooooo!'
 console master:5654    WARN    +0ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:53) 'Warning'
 socketio master:5654   LOG     +1937ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/socketio/index.js:8) 'Heartbeat 1327762973228'
 socketio master:5654   LOG     +1999ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/socketio/index.js:8) 'Heartbeat 1327762975227'
 konsole master:5654    INFO    +4135ms (/home/thomas/Projekte/Privat/konsole/examples/index.js:33) 'I did something'
 console master:5654    LOG     +4934ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/foo/index.js:13) 'Did this and that'
 console master:5654    WARN    +1ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/foo/index.js:8) 'Nooooo!'
 socketio master:5654   LOG     +2001ms (/home/thomas/Projekte/Privat/konsole/examples/node_modules/socketio/index.js:8) 'Heartbeat 1327762977228'
```

```
$ node examples/cluster.js
 console master:5703    LOG     +0ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:20) 'Listening on http://127.0.0.1:8000'
 console worker:5705    LOG     +0ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:29) 'Worker online'
 console worker:5706    LOG     +0ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:29) 'Worker online'
 console worker:5706    LOG     +2469ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5706    LOG     +155ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /favicon.ico'
 console worker:5706    LOG     +363ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5706    LOG     +85ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /favicon.ico'
 console worker:5706    LOG     +26ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5706    LOG     +216ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5706    LOG     +88ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /favicon.ico'
 console worker:5705    LOG     +3423ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +142ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +8ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +109ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +9ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +6ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +8ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +81ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +4ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +9ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +63ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +94ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:5705    LOG     +206ms (/home/thomas/Projekte/Privat/konsole/examples/cluster.js:25) 'Request:  /favicon.ico'
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
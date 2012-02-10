# EventEmitter powered console implementation

konsole and console APIs are identical.
So you can easily replace all your `console.log`, `console.warn`, `console.info` and `console.err` and
every other `console` method call with a konsole call.
Since version 2.0.0 konsole overrides the console calls. So you do not have to replace your console calls.
You will just have to `require("konsole")();` and all your console calls are kept back from written to stdout and
konsole will emit instead a `message`event.

## Usage

### Installation

    npm install konsole


### Example usage

#### Dummy Example (node examples/index.js)

```JavaScript

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


```

#### Cluster example from node.js docs (node examples/cluster.js)

```javascript
var restoreConsole = require("konsole")();
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

// Add the defaultListener, which will write every message to stdout.
// The defaultListener will also check if there is a trace and a diff
// otherwise it will display a shorter log.
console.addDefaultListener();

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

#### node examples/index.js output

```
$ node examples/index.js
 console master:6565    LOG     +0ms (/home/developer/projects/konsole/examples/node_modules/bar/index.js:1) 'I am bar'
 konsole master:6565    LOG     +0ms (/home/developer/projects/konsole/examples/index.js:40) 'konsole'
 console master:6565    LOG     +8ms (/home/developer/projects/konsole/examples/index.js:42) 'This log message gets not written to stdout'
 console master:6565    INFO    +1ms (/home/developer/projects/konsole/examples/index.js:43) 'Instead it emits an event on which you can listen with additional information'
 express master:6565    INFO    +0ms (/home/developer/projects/konsole/examples/node_modules/express/index.js:4) 'listening on 3000 in development mode'
 socketio master:6565   INFO    +0ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:4) 'Socket.IO started'
 console master:6565    LOG     +2ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:4) 'I am doing something'
 console master:6565    LOG     +0ms (/home/developer/projects/konsole/examples/index.js:55) 'foo: 17ms'
 konsole master:6565    INFO    +4ms (/home/developer/projects/konsole/examples/index.js:58) 'info from another konsole with a different label'
 console master:6565    LOG     +1ms (/home/developer/projects/konsole/examples/index.js:59) 'process.versions:  { node: '0.6.10',
  v8: '3.6.6.20',
  ares: '1.7.5-DEV',
  uv: '0.6',
  openssl: '0.9.8o' }'
 console master:6565    WARN    +1ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:8) 'Nooooo!'
 console master:6565    WARN    +1ms (/home/developer/projects/konsole/examples/index.js:66) 'Warning'
 socketio master:6565   LOG     +1941ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:8) 'Heartbeat 1328900455247'
 socketio master:6565   LOG     +2000ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:8) 'Heartbeat 1328900457247'
 konsole master:6565    INFO    +4138ms (/home/developer/projects/konsole/examples/index.js:45) 'I did something'
 console master:6565    LOG     +4937ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:13) 'Did this and that'
 console master:6565    WARN    +1ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:8) 'Nooooo!'
 socketio master:6565   LOG     +2000ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:8) 'Heartbeat 1328900459247'
 express master:6565    LOG     +6942ms (/home/developer/projects/konsole/examples/node_modules/express/index.js:8) 'Request'

```

#### node examples/cluster.js output

```
$ node examples/cluster.js
 console master:6576 LOG +0ms (/home/developer/projects/konsole/examples/cluster.js:20) 'Listening on http://127.0.0.1:8000'
 console worker:6579 LOG +0ms (/home/developer/projects/konsole/examples/cluster.js:29) 'Worker online'
 console worker:6578 LOG +0ms (/home/developer/projects/konsole/examples/cluster.js:29) 'Worker online'
 console worker:6579 LOG +7777ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6579 LOG +220ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /favicon.ico'
 console worker:6579 LOG +295ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6579 LOG +226ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /favicon.ico'
 console worker:6579 LOG +8ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6579 LOG +5ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6579 LOG +2ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6579 LOG +110ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +8617ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +300ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +128ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +5ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +17ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +218ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +636ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +290ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +121ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +8ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +3ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +3ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +102ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +107ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +119ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +132ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +94ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +76ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +70ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +122ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /'
 console worker:6578 LOG +1499ms (/home/developer/projects/konsole/examples/cluster.js:25) 'Request:  /favicon.ico'

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
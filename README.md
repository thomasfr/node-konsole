# EventEmitter powered debugger and logger for node.js

Konsoles API is identical to the native console object provided by node.js.
So you can easily switch to `konsole` by replacing all your console calls (e.g.: `console.log`, `console.warn`,
`console.info`, `console.err`, etc.) with a call to a konsole instance.

## TL;DR:


```JavaScript

var Konsole = require('konsole');
var konsole = new Konsole("MyLabel");

// Before:
//console.log("my debug message");

// After:
konsole.log("my debug message");

```

### OR

```JavaScript

var Konsole = require('konsole/overrideConsole');

console.log("my debug message");

```

## Automatic override of `console`
Since version 2.x you can automatically let `konsole` override your `console` calls.
So you do not have to replace your console calls as described above if you want that.
To do so you have to add `require('konsole/overrideConsole')` at the beginning of your module.
If you do so, all your console calls will emit an `message` event and a event according to the log level
instead of writing directly to stdout. So a `console.warn` will emit a `message` and a `warn` event. In this case the
label gets set to the string 'console'.

Take a look at the examples folder for a better understanding of how konsole should be used.

## Current Version
    2.2.0

## Usage

### Installation

    npm install konsole


### Example usage

#### Dummy Example (node examples/index.js)

```JavaScript

// This will automatically override calls to the internal console object
var restoreConsole = require("konsole/overrideConsole");

// You can restore the old console object afterwards.
// After calling console calls will not emit any event - console will work just as normal.
//restoreConsole();

// you can also create multiple konsoles with a different labels
// We want to relay events from this konsole to our "main" console object
// so we add it to the relay call.
var Konsole = require("konsole");
var konsole = new Konsole("MyLabel");

console.addDefaultListener();

// console got overriden from konsole.
// You can use console just as you used it before
console.time("foo");

var socketio = require("socketio");
var express = require("express");
var foo = require("foo");

// Lets assume that socketio, express or any other library were using konsole.
// To get all logs from those modules we would just relay those konsole events
// You can relay as many konsole objects as you like.
console.relay(socketio.konsole, express.konsole);


// you can create as many konsole instances as you like.
konsole.log("i will get the label 'MyLabel'");


// bar module itself does not export a konsole object, but uses
// console.* directly. If you let Konsole override console it will catch all calls and will emit an event instead.
var bar = require("bar");


console.log("This log message gets not written to stdout"); // This will emit a 'message' event and a 'log' event.
console.info("Instead it emits an event on which you can listen with additional information"); // This will emit a 'message' event and a 'info' event.

function doSomething() {
    console.info("I did something");
}
// Just for demonstrating
setInterval(doSomething, 4200);


// This is not really express and socketio.
// Just for demonstration, we mock those modules
var app = express.createServer();
var io = socketio.listen(app);


foo.doSomething();

console.timeEnd("foo");

// This will emit a 'message' event and a 'info' event relayed to  console object.
console.log("process.versions: ", process.versions);

foo.doSomethingElse();
console.warn("Warning");


```

#### Cluster example from node.js docs (node examples/cluster.js)

```javascript

var restoreConsole = require("konsole/overrideConsole");
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

// Add the defaultListener, which will write every message to stdout.
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
   console master:9148 LOG +0ms (/home/developer/projects/konsole/examples/node_modules/bar/index.js:1) 'I am bar'
   console master:9148 LOG +6ms (/home/developer/projects/konsole/examples/index.js:39) 'This log message gets not written to stdout'
   console master:9148 INFO +1ms (/home/developer/projects/konsole/examples/index.js:40) 'Instead it emits an event on which you can listen with additional information'
   express master:9148 INFO +0ms (/home/developer/projects/konsole/examples/index.js:51) 'listening on 3000 in development mode'
   socket.io master:9148 INFO +0ms (/home/developer/projects/konsole/examples/index.js:52) 'Socket.IO started'
   console master:9148 LOG +2ms (/home/developer/projects/konsole/examples/index.js:55) 'I am doing something'
   console master:9148 LOG +0ms (/home/developer/projects/konsole/examples/index.js:57) 'foo: 16ms'
   console master:9148 LOG +1ms (/home/developer/projects/konsole/examples/index.js:60) 'process.versions:  { node: '0.6.10',
    v8: '3.6.6.20',
    ares: '1.7.5-DEV',
    uv: '0.6',
    openssl: '0.9.8o' }'
   console master:9148 WARN +2ms (/home/developer/projects/konsole/examples/index.js:62) 'Nooooo!'
   console master:9148 WARN +0ms (/home/developer/projects/konsole/examples/index.js:63) 'Warning'
   socket.io master:9148 LOG +1941ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329348860'
   socket.io master:9148 LOG +2001ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329350862'
   console master:9148 INFO +4137ms (/home/developer/projects/konsole/examples/index.js:43) 'I did something'
   console master:9148 LOG +809ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:18) 'Did this and that'
   console master:9148 WARN +3ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:19) 'Nooooo!'
   socket.io master:9148 LOG +2000ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329352861'
   express master:9148 LOG +6943ms (/home/developer/projects/konsole/examples/node_modules/express/index.js:9) 'Request'
   socket.io master:9148 LOG +2000ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329354862'
   console master:9148 INFO +3388ms (/home/developer/projects/konsole/examples/index.js:43) 'I did something'
   socket.io master:9148 LOG +2000ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329356862'
   console master:9148 LOG +1603ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:18) 'Did this and that'
   console master:9148 WARN +2ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:19) 'Nooooo!'
   socket.io master:9148 LOG +2000ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329358862'
   console master:9148 INFO +2596ms (/home/developer/projects/konsole/examples/index.js:43) 'I did something'
   express master:9148 LOG +6999ms (/home/developer/projects/konsole/examples/node_modules/express/index.js:9) 'Request'
   socket.io master:9148 LOG +2004ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329360866'
   console master:9148 LOG +2400ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:18) 'Did this and that'
   console master:9148 WARN +2ms (/home/developer/projects/konsole/examples/node_modules/foo/index.js:19) 'Nooooo!'
   socket.io master:9148 LOG +1996ms (/home/developer/projects/konsole/examples/node_modules/socketio/index.js:9) 'Heartbeat 1329329362861'

```

#### node examples/cluster.js output

```

$ node examples/cluster.js
 console master:9170 LOG +0ms (/home/developer/projects/konsole/examples/cluster.js:18) 'Listening on http://127.0.0.1:8000'
 console worker:9172 LOG +0ms (/home/developer/projects/konsole/examples/cluster.js:27) 'Worker online'
 console worker:9173 LOG +0ms (/home/developer/projects/konsole/examples/cluster.js:27) 'Worker online'
 console worker:9173 LOG +10320ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +280ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /favicon.ico'
 console worker:9173 LOG +6398ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +148ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /favicon.ico'
 console worker:9173 LOG +367ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +148ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /favicon.ico'
 console worker:9173 LOG +9ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +76ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +98ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +130ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +7ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +3ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +142ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9173 LOG +87ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +18297ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +143ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +34ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +39ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +3ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +166ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +4ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +151ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +10ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +85ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /'
 console worker:9172 LOG +818ms (/home/developer/projects/konsole/examples/cluster.js:23) 'Request:  /favicon.ico'


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
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

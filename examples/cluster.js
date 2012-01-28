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
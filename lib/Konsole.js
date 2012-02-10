var util = require('util');
var format = util.format;
var EventEmitter = require('events').EventEmitter;
var defaultListener = require('./defaultListener');

// SemVer http://semver.org/
var version = '2.1.0';

var pattern = new RegExp(/^at (([^ ]+) )?(\(?([^:]+)*:([0-9]+)*:([0-9]+)*\)?)?$/g);
var slice = Array.prototype.slice;
var globalEventName = 'message';
var loglevels = ['log', 'info', 'warn', 'error'];

var proxies = ['dir', 'time', 'timeEnd', 'trace', 'assert'];
var createTrace = true;
var createDiff = true;
var times = {};
var emptyStack = {object:null, path:null, line:null, char:null};
var prevTime = {};

function parseStackLine(line) {
    var match, stack = [];
    while (match = pattern.exec(line)) {
        stack.push({ object:match[2] || null, path:match[4] || null, line:match[5] || null, char:match[6] || null });
    }
    return stack[0] || emptyStack;
}

function getTrace() {
    if (!createTrace) return emptyStack;
    return parseStackLine(getTraceLine());
}

function getTraceLine() {
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack.split("\n").splice(1), i = 0, l = stack.length, line = ""; // First line is "Error"
    for (i; i < l; i++) {
        line = (stack[i] || "").trim();
        if (!(new RegExp(__dirname)).test(line)) return line;
    }
}

function getDiff(label) {
    if (!createDiff) return null;
    var curr = new Date(),
        diff = curr - (prevTime[label] || curr);
    prevTime[label] = curr;
    return diff;
}

function emitHelper(level, args) {
    var label = this.label || "",
        diff = getDiff.apply(this, [label]),
        trace = getTrace.call(this),
        pid = process.pid,
        pType = (process.env.NODE_WORKER_ID ? 'worker' : 'master'),
        tEmit = this.emit,
        relayed = this.relayed;
    tEmit.apply(this, [globalEventName, level, label, args, pid, pType, trace, diff]);
    tEmit.apply(this, [level, label, args, pid, pType, trace, diff]);
}

function Konsole(label, options) {
    EventEmitter.call(this);
    options = options || {};
    if (options.trace == false) createTrace = false;
    if (options.diff == false) createDiff = false;
    this.label = label || "";
}
util.inherits(Konsole, EventEmitter);

loglevels.forEach(function (funcName) {
    Konsole.prototype[funcName] = function () {
        emitHelper.apply(this, [funcName, slice.call(arguments)]);
    }
});
proxies.forEach(function (funcName) {
    Konsole.prototype[funcName] = function () {
        return console[funcName].apply(console, arguments);
    }
});

Konsole.prototype.write = function () {
    process.stdout.write(format.apply(this, arguments) + '\n');
}
Konsole.prototype.format = function () {
    return format.apply(this, arguments);
}
Konsole.prototype.relay = function () {
    var that = this, origins = slice.call(arguments), tEmit = that.emit;
    origins.forEach(function (origin) {
        origin.relayed = true;
        origin.on(globalEventName, function () {
            var args = slice.call(arguments);
            tEmit.apply(that, [globalEventName].concat(args));
            tEmit.apply(that, args);
        });
    });
}
Konsole.prototype.version = version;
Konsole.prototype.addDefaultListener = function addDefaultListener() {
    var that = this;
    this.on('message', function () {
        return defaultListener.apply(that, arguments);
    });
}
Konsole.prototype.relayed = false;
Konsole.prototype.label = "";
Konsole.prototype.time = function (label) {
    times[label] = Date.now();
};
Konsole.prototype.timeEnd = function (label) {
    var duration = Date.now() - times[label];
    this.log('%s: %dms', label, duration);
};
module.exports = Konsole;
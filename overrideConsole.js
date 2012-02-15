/**
 * This will override all console calls to a Konsole object instance.
 * You just have to add a 'require('Konsole/overrideConsole');'
 * to any module and you are able to add listeners to console
 */
var Konsole = require('./lib/Konsole');
var additions = ['addDefaultListener', 'on', 'relay'];
var overrides = ['log', 'info', 'warn', 'error', 'time', 'timeEnd'];
var consoleLabel = 'console';
var orig;
if (!orig) {
    orig = {};
    var konsole = new Konsole(consoleLabel);
    overrides.forEach(function overrideConsole(funcName) {
        orig[funcName] = console[funcName] || undefined;
        console[funcName] = function () {
            return konsole[funcName].apply(konsole, arguments);
        }
    });
    additions.forEach(function addToConsole(funcName) {
        console[funcName] = function () {
            return konsole[funcName].apply(konsole, arguments);
        }
    });
}
module.exports = function () {
    overrides.forEach(function (funcName) {
        console[funcName] = orig[funcName];
    });
    additions.forEach(function (funcName) {
        delete console[funcName];
    });
    orig = null;
    delete orig;
}
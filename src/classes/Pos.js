"use strict";
exports.__esModule = true;
var Pos = /** @class */ (function () {
    function Pos(x, y) {
        this.x = x;
        this.y = y;
    }
    Pos.prototype.toString = function () {
        return this.x + ':' + this.y;
    };
    Pos.from = function (string) {
        var x = parseInt(string.split(':')[0]);
        var y = parseInt(string.split(':')[1]);
        return new Pos(x, y);
    };
    Pos.prototype.isSame = function (pos) {
        return pos !== undefined && pos.x === this.x && pos.y === this.y;
    };
    Pos.prototype.inHex = function (pos, radius) {
        if (radius === void 0) { radius = 1; }
        if (pos === undefined)
            return false;
        if (radius === Infinity)
            return this.isSame(pos);
        var x = pos.x - this.x;
        var y = pos.y - this.y;
        return (Math.abs(x + y) <= radius) && Math.abs(y) <= radius && Math.abs(x) <= radius;
    };
    Pos.prototype.isometric = function () {
        return new Pos(this.x + Math.floor(this.y / 2), this.y);
    };
    return Pos;
}());
exports.Pos = Pos;
exports["default"] = Pos;

"use strict";
exports.__esModule = true;
var Tile_1 = require("./Tile");
var Tiles = /** @class */ (function () {
    function Tiles(container, radius, tiles) {
        if (tiles === void 0) { tiles = new Map(); }
        this.container = container;
        this.radius = radius;
        this.tiles = tiles;
        this.changed = new Map();
    }
    Tiles.prototype.forEach = function (func) {
        this.tiles.forEach(func);
    };
    Tiles.prototype.map = function (func) {
        var u = [];
        this.tiles.forEach(function (tile, pos) {
            u.push(func(tile, pos));
        });
        return u;
    };
    Tiles.prototype.get = function (pos) {
        var tile = this.tiles.get(pos);
        return tile ? tile.clone() : undefined;
    };
    Tiles.prototype.apply = function () {
        var _this = this;
        this.changed.forEach(function (tile, pos) {
            _this.tiles.set(pos, tile);
        });
        if (this.container)
            this.container.setState({ tiles: this.clone() });
    };
    Tiles.prototype.tick = function (pos, radius) {
        if (radius === void 0) { radius = this.radius; }
        this.resetChanges();
        if (this.container)
            this.container.tick();
        var next = this.clone();
        var neighboors = next.neighboors(pos, radius, true);
        var largerNeighboors = next.neighboors(pos, radius + 1, true);
        //increment day
        neighboors.forEach(function (n, p) {
            n.day++;
            n.changed = true;
        });
        //update diff
        largerNeighboors.forEach(function (n, p) { return n.updateDiff(next, p); });
        //tick
        neighboors.forEach(function (n, p) {
            var set = n.createSet();
            set.tick(next, p);
            var changed = next.changed.get(p) || set.apply();
            changed = Object.assign(changed, set.apply());
            next.changed.set(p, changed);
        });
        next.apply();
    };
    Tiles.prototype.resetChanges = function () {
        this.tiles.forEach(function (tile, pos) { tile.changed = false; });
        this.changed = new Map();
    };
    Tiles.prototype.clone = function () {
        var tiles = new Map(this.tiles);
        return new Tiles(this.container, this.radius, tiles);
    };
    Tiles.prototype.add = function (pos) {
        var tile = new Tile_1["default"]();
        this.container.generator.generateAt(tile, pos);
        this.tiles.set(pos, tile);
    };
    Tiles.prototype.neighboors = function (center, radius, addCenter) {
        if (radius === void 0) { radius = 1; }
        if (addCenter === void 0) { addCenter = false; }
        var map = new Map(this.tiles);
        if (radius < Infinity)
            for (var _i = 0, _a = Array.from(this.tiles.keys()).filter(function (pos) {
                return !(pos.inHex(center, radius) && (addCenter || !center.isSame(pos)));
            }); _i < _a.length; _i++) {
                var key = _a[_i];
                map["delete"](key);
            }
        map.forEach(function (tile, pos) {
            map.set(pos, tile.clone());
        });
        return map;
    };
    Object.defineProperty(Tiles.prototype, "night", {
        get: function () {
            return this.container.state.isNight;
        },
        enumerable: true,
        configurable: true
    });
    return Tiles;
}());
exports.Tiles = Tiles;
exports["default"] = Tiles;

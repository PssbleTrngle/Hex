"use strict";
exports.__esModule = true;
var Detail_1 = require("./Detail");
var Type_1 = require("./Type");
var Lunar_1 = require("./Lunar");
var Season_1 = require("./Season");
var Tribe_1 = require("./Tribe");
var Tile = /** @class */ (function () {
    function Tile() {
        this.type = Type_1["default"].NULL;
        this.detail = undefined;
        this.willBurn = false;
        this.growth = 0;
        this.beforeBurning = undefined;
        this.warded = false;
        this.taintProcess = false;
        this.snowed = false;
        this._temp = 0;
        this.energy = 0;
        this.day = 0;
        this.diff = 0;
        this.changed = false;
        this.tribes = new Map();
    }
    Object.defineProperty(Tile.prototype, "temp", {
        get: function () {
            return Math.max(-1, Math.min(1, this._temp + this.season.tempMod));
        },
        set: function (temp) {
            this._temp = temp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "season", {
        get: function () {
            return Season_1["default"].get(this.day);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tile.prototype, "lunar", {
        get: function () {
            return Lunar_1["default"].get(this.day);
        },
        enumerable: true,
        configurable: true
    });
    Tile.prototype.addTribe = function (tribe, amount) {
        if (amount === void 0) { amount = 1; }
        var total = Object.values(this.tribes).reduce(function (prev, curr) { return prev + curr; }, 0);
        if (total + amount <= Tribe_1["default"].MAX) {
            var current = this.tribes.get(tribe) || 0;
            this.tribes.set(tribe, Math.max(0, current + amount));
        }
    };
    Tile.prototype.applyInfluences = function (neighboor) {
        for (var _i = 0, _a = this.type.influences; _i < _a.length; _i++) {
            var influence = _a[_i];
            if (influence.replace instanceof Type_1["default"] && influence.affect === neighboor.get.type) {
                neighboor.set.type = influence.replace;
                break;
            }
        }
    };
    Tile.prototype.clone = function () {
        var newTile = new Tile();
        Object.assign(newTile, this);
        return newTile;
    };
    Tile.prototype.updateDiff = function (tiles, pos, justCollapsed) {
        var _this = this;
        if (justCollapsed === void 0) { justCollapsed = false; }
        var diff = 0;
        tiles.neighboors(pos).forEach(function (n, p) { return diff = Math.max((n.day - _this.day), diff); });
        this.diff = diff;
        if (!justCollapsed && diff > Tile.MAX_DIFF)
            this.collapse(pos, tiles);
    };
    Tile.prototype.collapse = function (pos, tiles) {
        var max = Number.MIN_SAFE_INTEGER;
        var min = Number.MAX_SAFE_INTEGER;
        tiles.neighboors(pos).forEach(function (n, p) {
            var day = n.day;
            max = Math.max(max, day);
            min = Math.min(min, day);
        });
        var day = Math.floor((max + min) / 2);
        this.day = day;
        if (Math.random() < 0.1) {
            this.detail = Detail_1.Details.RIFTS[0];
            this.taintProcess = 1;
        }
        tiles.neighboors(pos, 1, true).forEach(function (n, p) { return n.updateDiff(tiles, p, true); });
    };
    Tile.prototype.createSet = function () {
        return new Set(this);
    };
    Tile.TAINT_TEMP = 0;
    Tile.SNOW_TEMP = -0.6;
    Tile.MAX_DIFF = 5;
    return Tile;
}());
exports.Tile = Tile;
var Set = /** @class */ (function () {
    function Set(get) {
        this.get = Object.freeze(get.clone());
        this.set = get.clone();
    }
    Set.prototype.tick = function (tiles, pos) {
        var _this = this;
        tiles.neighboors(pos).forEach(function (n, p) {
            n.applyInfluences(_this);
            if (_this.get.type.tainted && n.temp < Tile.TAINT_TEMP && !n.taintProcess) {
                switch (n.type) {
                    case Type_1["default"].DIRT:
                    case Type_1["default"].GRASS:
                    case Type_1["default"].SAND:
                    case Type_1["default"].WATER:
                        n.taintProcess = 1;
                }
            }
            if (_this.get.type === Type_1["default"].HOLY_LAND)
                n.warded = true;
        });
        if (this.get.warded && this.get.taintProcess)
            this.set.taintProcess = false;
        if (this.get.taintProcess === 1 && !this.get.warded) {
            if (this.get.type === Type_1["default"].WATER)
                this.set.type = Type_1["default"].POISON;
            else
                this.set.type = Type_1["default"].TAINT;
            this.set.taintProcess = false;
        }
        else if (this.set.taintProcess)
            this.set.taintProcess--;
        if (this.get.type.tainted && this.get.detail)
            this.set.detail = this.get.detail.tainted;
        this.set.snowed = !this.get.type.liquid && this.get.type !== Type_1["default"].ICE && this.get.temp < Tile.SNOW_TEMP;
        if (this.get.type === Type_1["default"].WATER && this.get.temp < Tile.SNOW_TEMP)
            this.set.type = Type_1["default"].ICE;
        if (this.get.type === Type_1["default"].ICE && this.get.temp >= Tile.SNOW_TEMP)
            this.set.type = Type_1["default"].WATER;
        if (this.get.detail)
            this.get.detail.tick(tiles, pos, this);
        this.get.tribes.forEach(function (amount, tribe) {
            tribe.tick(tiles, pos, _this);
        });
        this.apply();
    };
    Set.prototype.apply = function () {
        return this.set.clone();
    };
    return Set;
}());
exports.Set = Set;
exports["default"] = Tile;

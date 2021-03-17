"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var colors_1 = require("../colors");
var Tile_1 = require("./Tile");
var open_simplex_noise_1 = require("open-simplex-noise");
var DisplayType = /** @class */ (function () {
    function DisplayType(details, icon) {
        this.details = details;
        this.icon = icon;
    }
    DisplayType.prototype.text = function (tile, pos) { return undefined; };
    return DisplayType;
}());
exports.DisplayType = DisplayType;
var Default = /** @class */ (function (_super) {
    __extends(Default, _super);
    function Default() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.noise = new open_simplex_noise_1["default"](42);
        return _this;
    }
    Default.prototype.color = function (tile, pos) {
        var noise = 0;
        var x = pos.x - Math.floor(pos.y / 2);
        var y = pos.y;
        var noNoise = false;
        var cleanNoise = false;
        var color;
        if (tile.snowed) {
            var s = cleanNoise ? 10 : 1;
            color = ['#EEE', '#DDD'];
            noise = noNoise ? 0.5 : Math.abs(this.noise.noise2D(x / s, y / s));
        }
        else if (Array.isArray(tile.type.color)) {
            var s = 10;
            color = tile.type.color;
            noise = noNoise ? 0.5 : Math.abs(this.noise.noise2D(x / s, y / s));
        }
        else {
            var s = cleanNoise ? 10 : 1;
            color = [tile.type.color, '#000'];
            noise = noNoise ? 0 : Math.abs(this.noise.noise2D(x / s, y / s)) * (cleanNoise ? 0.2 : 0.12);
        }
        return colors_1.blend(color[0], color[1], noise);
    };
    return Default;
}(DisplayType));
var Temp = /** @class */ (function (_super) {
    __extends(Temp, _super);
    function Temp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Temp.prototype.color = function (tile, pos) {
        var deg = 240 * (1 - (tile.temp + 1) / 2);
        return 'hsl(' + deg + ', 90%, 40%)';
        /* Simply blend between red and blue
        let red = '#d12424';
        let blue = '#244fd1';

        return blend(blue, red, (tile.temp + 1) / 2);
        */
    };
    return Temp;
}(DisplayType));
var Energy = /** @class */ (function (_super) {
    __extends(Energy, _super);
    function Energy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Energy.prototype.color = function (tile, pos) {
        var blue = '#17fffb';
        return colors_1.blend('#000', blue, tile.energy);
    };
    return Energy;
}(DisplayType));
var Season = /** @class */ (function (_super) {
    __extends(Season, _super);
    function Season() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Season.prototype.color = function (tile, pos) {
        return tile.season.color;
    };
    Season.prototype.text = function (tile, pos) {
        return tile.day.toString();
    };
    return Season;
}(DisplayType));
var Time = /** @class */ (function (_super) {
    __extends(Time, _super);
    function Time() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Time.prototype.color = function (tile, pos) {
        var diff = tile.diff;
        var blue = '#17fffb';
        return colors_1.blend('#333', blue, diff / Tile_1["default"].MAX_DIFF);
    };
    Time.prototype.text = function (tile, pos) {
        return tile.diff !== 0 ? tile.diff.toString() : undefined;
    };
    return Time;
}(DisplayType));
exports.DISPLAY_TYPES = [
    new Default(true, '👁'),
    new Temp(false, '🌡'),
    new Energy(false, '💠'),
    new Season(false, '📅'),
    new Time(false, '🕗')
];
exports["default"] = exports.DISPLAY_TYPES;

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
var Type_1 = require("./Type");
var Tribe_1 = require("./Tribe");
var Detail = /** @class */ (function () {
    function Detail(color, name) {
        this.color = color;
        this.name = name;
        this.canBurn = false;
        this._tainted = undefined;
    }
    Object.defineProperty(Detail.prototype, "tainted", {
        get: function () {
            return this._tainted || this;
        },
        enumerable: true,
        configurable: true
    });
    Detail.prototype.tick = function (tiles, pos, tile) { };
    Detail.prototype.size = function (tile) {
        return 1;
    };
    Detail.prototype.setTainted = function (tainted) {
        this._tainted = tainted;
        return this;
    };
    Detail.prototype.icon = function () { return undefined; };
    return Detail;
}());
exports.Detail = Detail;
var Rift = /** @class */ (function (_super) {
    __extends(Rift, _super);
    function Rift(color, riftSize, name) {
        var _this = _super.call(this, color, name) || this;
        _this.riftSize = riftSize;
        return _this;
    }
    Rift.prototype.icon = function () {
        if (!Rift.USE_SVG)
            return _super.prototype.icon.call(this);
        return this.name;
    };
    Rift.prototype.tick = function (tiles, pos, tile) {
        if (tile.get.lunar.growRift)
            this.grow(tile.set);
    };
    Rift.prototype.grow = function (tile) {
        var next = Details.RIFTS[Math.min(this.riftSize, Details.RIFTS.length - 1)];
        tile.detail = next;
        tile.addTribe(Tribe_1["default"].DEMONS, Math.floor(this.riftSize / 2));
    };
    Rift.prototype.size = function (tile) {
        if (Rift.USE_SVG)
            return 0.6 + 0.4 * this.riftSize;
        return this.riftSize / 4;
    };
    Rift.USE_SVG = true;
    return Rift;
}(Detail));
exports.Rift = Rift;
var Plant = /** @class */ (function (_super) {
    __extends(Plant, _super);
    function Plant(color, max, name, fireResistant) {
        if (fireResistant === void 0) { fireResistant = false; }
        var _this = _super.call(this, color, name) || this;
        _this.max = max;
        _this.canBurn = !fireResistant;
        return _this;
    }
    Object.defineProperty(Plant.prototype, "burnedVersion", {
        get: function () {
            return Details.BURNING_TREE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Plant.prototype, "deadVersion", {
        get: function () {
            return Details.DEAD_TREE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Plant.prototype, "taintedVersion", {
        get: function () {
            return this.deadVersion;
        },
        enumerable: true,
        configurable: true
    });
    Plant.prototype.setTainted = function (tainted) {
        _super.prototype.setTainted.call(this, tainted);
        return this;
    };
    Plant.prototype.grow = function (tile) {
        if (tile.growth < this.max)
            tile.growth++;
    };
    Plant.prototype.tick = function (tiles, pos, tile) {
        this.grow(tile.set);
        if (this.canBurn && (Math.random() * tile.get.temp > 0.7 || tile.get.willBurn)) {
            tile.set.detail = this.burnedVersion;
            tile.set.willBurn = false;
            tile.set.beforeBurning = this;
        }
        if (this === Details.BURNING_TREE) {
            if (tile.get.beforeBurning && tile.get.temp < 0.8 && Math.random() < 0.5)
                tile.set.detail = tile.get.beforeBurning;
            else {
                tiles.neighboors(pos).forEach(function (n, p) {
                    if (n && n.detail && n.detail.canBurn)
                        n.willBurn = true;
                });
                tile.set.detail = this.deadVersion;
            }
        }
    };
    Plant.prototype.size = function (tile) {
        return tile.growth / this.max;
    };
    return Plant;
}(Detail));
exports.Plant = Plant;
var Crop = /** @class */ (function (_super) {
    __extends(Crop, _super);
    function Crop() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Crop.prototype, "burnedVersion", {
        get: function () {
            return Details.BURNING_CROPS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Crop.prototype, "deadVersion", {
        get: function () {
            return Details.BURNED_CROPS;
        },
        enumerable: true,
        configurable: true
    });
    Crop.prototype.size = function () {
        return 0.8;
    };
    return Crop;
}(Plant));
var SacredTree = /** @class */ (function (_super) {
    __extends(SacredTree, _super);
    function SacredTree(color, max, name) {
        return _super.call(this, color, max, name, true) || this;
    }
    SacredTree.prototype.tick = function (tiles, pos, tile) {
        _super.prototype.tick.call(this, tiles, pos, tile);
        if (tile.get.growth === this.max) {
            tiles.neighboors(pos).forEach(function (n, p) {
                if (n.type.tainted)
                    n.type = Type_1["default"].DIRT;
                else if (n.type === Type_1["default"].DIRT)
                    n.type = Type_1["default"].GRASS;
                else
                    n.type = Type_1["default"].HOLY_LAND;
            });
            tile.set.type = Type_1["default"].HOLY_LAND;
        }
    };
    SacredTree.prototype.size = function (tile) {
        return _super.prototype.size.call(this, tile) * 1.2;
    };
    return SacredTree;
}(Plant));
var Details = /** @class */ (function () {
    function Details() {
    }
    Details.ROCK = new Detail('#9e928c', 'Rock');
    Details.DEAD_TREE = new Plant('#5c5141', 4, 'Dead Tree', true);
    Details.TREE = new Plant('#2b6b1a', 4, 'Tree').setTainted(Details.DEAD_TREE);
    Details.BURNING_TREE = new Plant('#e83023', 4, 'Burning Tree');
    Details.SACRED_OAK = new SacredTree('#945207', 8, 'Sacred Oak');
    Details.RIFTS = [
        new Rift('#000', 1, 'Breach'),
        new Rift('#000', 2, 'Rift'),
        new Rift('#000', 3, 'Portal'),
        new Rift('#000', 4, 'Gateway')
    ];
    Details.WHEAT = new Crop('#c9b169', 3, 'Wheat');
    Details.BURNING_CROPS = new Crop('#e83023', 3, 'Burning Crops');
    Details.BURNED_CROPS = new Crop('#5c5141', 3, 'Burned Crops');
    return Details;
}());
exports.Details = Details;
exports["default"] = Details;

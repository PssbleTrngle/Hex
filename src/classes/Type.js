"use strict";
exports.__esModule = true;
var Type = /** @class */ (function () {
    function Type(_color, name) {
        this._color = _color;
        this.name = name;
        this.liquid = false;
        this.glowing = false;
        this.tainted = false;
        this.influences = [];
    }
    Type.prototype.isLiquid = function () {
        this.liquid = true;
        return this;
    };
    Type.prototype.isGlowing = function () {
        this.glowing = true;
        return this;
    };
    Object.defineProperty(Type.prototype, "color", {
        get: function () {
            return this._color;
        },
        enumerable: true,
        configurable: true
    });
    Type.prototype.influence = function (affects, replace) {
        for (var _i = 0, affects_1 = affects; _i < affects_1.length; _i++) {
            var affect = affects_1[_i];
            this.influences.push({ affect: affect, replace: replace });
        }
        return this;
    };
    Type.prototype.isTainted = function () {
        this.tainted = true;
        return this;
    };
    Type.NULL = new Type('#000000', 'NULL');
    Type.GRASS = new Type('#54b830', 'Grass');
    Type.DIRT = new Type('#8f642c', 'Dirt');
    Type.STONE = new Type('#9e928c', 'Stone');
    Type.MUD = new Type('#7a5727', 'Mud');
    Type.SAND = new Type('#e0d284', 'Sand');
    Type.VOLCANIC_ROCK = new Type('#513227', 'Volcanic Rock');
    Type.ASH = new Type('#544c49', 'Ash');
    Type.VOLCANIC_SAND = new Type('#b5a96a', 'Volcanic Sand');
    Type.ICE = new Type('#a8cbdb', 'Ice');
    Type.LAVA = new Type(["#f44122", "#ff932d"], 'Lava').isLiquid().isGlowing()
        .influence([Type.GRASS], Type.DIRT)
        .influence([Type.MUD], Type.DIRT)
        .influence([Type.DIRT], Type.ASH);
    Type.WATER = new Type(["#48abc4", "#2066ab"], 'Water').isLiquid()
        .influence([Type.DIRT], Type.MUD)
        .influence([Type.MUD], Type.GRASS)
        .influence([Type.MUD], Type.GRASS)
        .influence([Type.LAVA], Type.VOLCANIC_ROCK);
    Type.TAINT = new Type('#a569af', 'Taint').isTainted();
    Type.POISON = new Type(["#a58ecc", "#d684e8"], 'Poison').isTainted().isLiquid();
    Type.HOLY_LAND = new Type('#dfef39', 'Holy Land')
        .influence([Type.POISON], Type.WATER)
        .influence([Type.TAINT], Type.DIRT);
    Type.NECTAR = new Type(["#f9c909", "#f9ad09"], 'Nectar');
    Type.FARMLAND = new Type('#7a5727', 'Farmland');
    return Type;
}());
exports["default"] = Type;

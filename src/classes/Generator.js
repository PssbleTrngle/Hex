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
var Collection_1 = require("./Collection");
var Tile_1 = require("./Tile");
var Type_1 = require("./Type");
var Tribe_1 = require("./Tribe");
var Detail_1 = require("./Detail");
var open_simplex_noise_1 = require("open-simplex-noise");
var GeneratorPart = /** @class */ (function () {
    function GeneratorPart() {
    }
    GeneratorPart.prototype.seed = function (seed) {
        this.noise = new open_simplex_noise_1["default"](seed * 12908);
    };
    Object.defineProperty(GeneratorPart.prototype, "times", {
        get: function () {
            return 1;
        },
        enumerable: true,
        configurable: true
    });
    return GeneratorPart;
}());
var TreeGenerator = /** @class */ (function (_super) {
    __extends(TreeGenerator, _super);
    function TreeGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TreeGenerator.prototype.generateAt = function (tile, pos, random) {
        var s = 20;
        var r = Math.abs(this.noise.noise2D(pos.x / s, pos.y / s));
        if (tile.type === Type_1["default"].GRASS) {
            if (r > 0.6 || tile.energy > 0.6) {
                tile.detail = Detail_1["default"].TREE;
                tile.growth = Detail_1["default"].TREE.max - Math.floor(random * 1.2);
                tile.growth = Math.max(1, tile.growth);
            }
        }
    };
    return TreeGenerator;
}(GeneratorPart));
var EnergyGenerator = /** @class */ (function (_super) {
    __extends(EnergyGenerator, _super);
    function EnergyGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(EnergyGenerator.prototype, "times", {
        get: function () {
            return 3;
        },
        enumerable: true,
        configurable: true
    });
    EnergyGenerator.prototype.generateAt = function (tile, pos, random) {
        if (!tile.energy)
            tile.energy = 0;
        var s = 40;
        var energy = Math.abs(this.noise.noise2D(pos.x / s, pos.y / s));
        energy = 1 - Math.sin(energy * Math.PI);
        energy = Math.pow(energy, 3) * 0.34;
        tile.energy = Math.max(0, Math.min(1, energy + tile.energy));
    };
    return EnergyGenerator;
}(GeneratorPart));
var HolyGenerator = /** @class */ (function (_super) {
    __extends(HolyGenerator, _super);
    function HolyGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HolyGenerator.prototype.generateAt = function (tile, pos, random) {
        if (tile.energy > 0.77) {
            if (tile.type === Type_1["default"].LAVA)
                tile.type = Type_1["default"].NECTAR;
            else
                tile.type = Type_1["default"].HOLY_LAND;
            if (random > 0.8) {
                tile.detail = Detail_1["default"].SACRED_OAK;
                tile.growth = 1;
            }
        }
    };
    return HolyGenerator;
}(GeneratorPart));
var TaintGenerator = /** @class */ (function (_super) {
    __extends(TaintGenerator, _super);
    function TaintGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TaintGenerator.prototype.generateAt = function (tile, pos, random) {
        var s = 40;
        var r = Math.abs(this.noise.noise2D(pos.x / s, pos.y / s));
        if (r > 0.8 && tile.temp < Tile_1["default"].TAINT_TEMP) {
            if (random > 0.9)
                tile.detail = Detail_1["default"].RIFTS[0];
            if (tile.type === Type_1["default"].WATER)
                tile.type = Type_1["default"].POISON;
            else
                tile.type = Type_1["default"].TAINT;
        }
    };
    return TaintGenerator;
}(GeneratorPart));
var TempGenerator = /** @class */ (function (_super) {
    __extends(TempGenerator, _super);
    function TempGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TempGenerator.prototype.generateAt = function (tile, pos, random) {
        var s = 13;
        var temp = this.noise.noise2D(pos.x / s, pos.y / s) / -0.8;
        tile.temp = Math.max(-1, Math.min(1, temp));
    };
    return TempGenerator;
}(GeneratorPart));
var LavaGenerator = /** @class */ (function (_super) {
    __extends(LavaGenerator, _super);
    function LavaGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LavaGenerator.prototype.generateAt = function (tile, pos, random) {
        if (tile.temp >= 0.95)
            tile.type = Type_1["default"].LAVA;
    };
    return LavaGenerator;
}(GeneratorPart));
var GroundGenerator = /** @class */ (function (_super) {
    __extends(GroundGenerator, _super);
    function GroundGenerator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.standard = new Collection_1["default"]()
            .add(Type_1["default"].GRASS, 1)
            .add(Type_1["default"].DIRT, 0.2)
            .add(Type_1["default"].STONE, 0.3);
        _this.hot = new Collection_1["default"]()
            .add(Type_1["default"].VOLCANIC_ROCK, 1)
            .add(Type_1["default"].ASH, 0.4)
            .add(Type_1["default"].DIRT, 0.1);
        _this.cold = new Collection_1["default"]()
            .add(Type_1["default"].DIRT, 1);
        return _this;
    }
    GroundGenerator.prototype.generateAt = function (tile, pos, random) {
        random = (this.noise.noise2D(pos.x / 3, pos.y / 3) / 0.8 + 1) / 2;
        var use = this.standard;
        if (tile.temp > 0.8)
            use = this.hot;
        else if (tile.temp < -0.8)
            use = this.cold;
        var type = use.get(random);
        tile.type = type ? type : Type_1["default"].NULL;
    };
    return GroundGenerator;
}(GeneratorPart));
var RiverGenerator = /** @class */ (function (_super) {
    __extends(RiverGenerator, _super);
    function RiverGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RiverGenerator.prototype.generateAt = function (tile, pos, random) {
        var s = 30;
        var n = Math.abs(this.noise.noise2D(pos.x / s, pos.y / s));
        if (n < 0.1) {
            if (tile.temp > 0.8)
                tile.type = Type_1["default"].VOLCANIC_SAND;
            else if (tile.temp < -0.8)
                tile.type = Type_1["default"].ICE;
            else
                tile.type = Type_1["default"].WATER;
        }
        else if (n < 0.15) {
            if (tile.temp > 0.8)
                tile.type = Type_1["default"].VOLCANIC_SAND;
            else if (tile.temp > -0.5)
                tile.type = Type_1["default"].SAND;
        }
    };
    return RiverGenerator;
}(GeneratorPart));
var MonsterGenerator = /** @class */ (function (_super) {
    __extends(MonsterGenerator, _super);
    function MonsterGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MonsterGenerator.prototype.generateAt = function (tile, pos, random) {
        if (random < 0.007)
            switch (tile.type) {
                case Type_1["default"].GRASS:
                case Type_1["default"].DIRT:
                case Type_1["default"].SAND:
                case Type_1["default"].MUD:
                case Type_1["default"].VOLCANIC_ROCK:
                case Type_1["default"].WATER:
                case Type_1["default"].LAVA:
                    tile.tribes.set(Tribe_1["default"].MONSTERS, 1);
            }
    };
    return MonsterGenerator;
}(GeneratorPart));
var HumanGenerator = /** @class */ (function (_super) {
    __extends(HumanGenerator, _super);
    function HumanGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HumanGenerator.prototype.generateAt = function (tile, pos, random) {
        var s = 20;
        var n = Math.abs(this.noise.noise2D(pos.x / s, pos.y / s));
        if (n < 0.01 && tile.temp > 0)
            switch (tile.type) {
                case Type_1["default"].GRASS:
                case Type_1["default"].DIRT:
                case Type_1["default"].SAND:
                case Type_1["default"].MUD:
                    if (random < 0.6)
                        tile.tribes.set(Tribe_1["default"].HUMANS, Math.floor(random * 10) % 2 + 1);
                    else {
                        tile.type = Type_1["default"].FARMLAND;
                        tile.detail = Detail_1["default"].WHEAT;
                    }
            }
    };
    return HumanGenerator;
}(GeneratorPart));
var SpiritGenerator = /** @class */ (function (_super) {
    __extends(SpiritGenerator, _super);
    function SpiritGenerator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SpiritGenerator.prototype.generateAt = function (tile, pos, random) {
        var barrier = 0.85;
        if (tile.energy > barrier && !tile.type.liquid)
            tile.tribes.set(Tribe_1["default"].SPIRITS, Math.floor(tile.energy / barrier * 2));
    };
    return SpiritGenerator;
}(GeneratorPart));
var Generator = /** @class */ (function () {
    function Generator(seed, randomize) {
        this.seed = seed;
        this.randomize = randomize;
        this.generators = [];
        this.generators.push(new TempGenerator());
        for (var i = 0; i < 3; i++)
            this.generators.push(new EnergyGenerator());
        this.generators.push(new GroundGenerator());
        this.generators.push(new RiverGenerator());
        this.generators.push(new LavaGenerator());
        this.generators.push(new TreeGenerator());
        this.generators.push(new TaintGenerator());
        this.generators.push(new HolyGenerator());
        this.generators.push(new HumanGenerator());
        this.generators.push(new SpiritGenerator());
        this.generators.push(new MonsterGenerator());
        for (var _i = 0, _a = this.generators; _i < _a.length; _i++) {
            var gen = _a[_i];
            gen.seed(this.random());
        }
    }
    Generator.prototype.random = function () {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    };
    Generator.prototype.generateAt = function (tile, pos) {
        for (var _i = 0, _a = this.generators; _i < _a.length; _i++) {
            var gen = _a[_i];
            gen.generateAt(tile, pos.isometric(), this.random());
        }
    };
    return Generator;
}());
exports.Generator = Generator;
exports["default"] = Generator;

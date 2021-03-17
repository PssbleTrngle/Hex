"use strict";
exports.__esModule = true;
var Tribe = /** @class */ (function () {
    function Tribe(color, name, grow) {
        if (grow === void 0) { grow = function () { return false; }; }
        this.color = color;
        this.name = name;
        this.grow = grow;
    }
    Tribe.prototype.tick = function (tiles, pos, tile) {
        var amount = this.grow(tiles, pos, tile);
        if (amount)
            tile.set.addTribe(this, amount);
    };
    Tribe.prototype.toString = function () {
        return this.name;
    };
    Tribe.HUMANS = new Tribe('#3957c4', 'Human', function (tiles, pos, tile) { return 1; });
    Tribe.SPIRITS = new Tribe('#4ecdde', 'Spirit');
    Tribe.DEMONS = new Tribe('#993fd9', 'Demon');
    Tribe.MONSTERS = new Tribe('#bf1717', 'Monster');
    Tribe.MAX = 8;
    return Tribe;
}());
exports.Tribe = Tribe;
exports["default"] = Tribe;

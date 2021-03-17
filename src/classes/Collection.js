"use strict";
exports.__esModule = true;
var Collection = /** @class */ (function () {
    function Collection() {
        this.map = [];
        this.total = 0;
    }
    Collection.prototype.add = function (value, chance) {
        this.map.push({ value: value, chance: chance });
        this.total += chance;
        return this;
    };
    Collection.prototype.get = function (random) {
        if (random === void 0) { random = Math.random(); }
        random = Math.min(1, Math.max(0, random));
        random *= this.total;
        var t = 0;
        for (var _i = 0, _a = this.map; _i < _a.length; _i++) {
            var entry = _a[_i];
            t += entry.chance;
            if (t >= random)
                return entry.value;
        }
        return null;
    };
    return Collection;
}());
exports["default"] = Collection;

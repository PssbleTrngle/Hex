"use strict";
exports.__esModule = true;
var Lunar = /** @class */ (function () {
    function Lunar(icon, name, growRift) {
        if (growRift === void 0) { growRift = false; }
        this.icon = icon;
        this.name = name;
        this.growRift = growRift;
    }
    Lunar.get = function (days) {
        return Lunar.VALUES[(Math.floor(days / Lunar.DAYS_PER_PHASE) + Lunar.START) % Lunar.VALUES.length];
    };
    Lunar.DAYS_PER_PHASE = 3;
    Lunar.START = 1;
    Lunar.VALUES = [
        new Lunar('🌑', 'New Moon'),
        new Lunar('🌒', 'Waxing Crescent'),
        new Lunar('🌓', 'First Quarter'),
        new Lunar('🌔', 'Waxing Gibbous', true),
        new Lunar('🌕', 'Full Moon'),
        new Lunar('🌖', 'Waning Gibbous'),
        new Lunar('🌗', 'Last Quarter'),
        new Lunar('🌘', 'Waning Crescent', true)
    ];
    return Lunar;
}());
exports["default"] = Lunar;

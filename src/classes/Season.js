"use strict";
exports.__esModule = true;
var Season = /** @class */ (function () {
    function Season(icon, name, tempMod, color) {
        this.icon = icon;
        this.name = name;
        this.tempMod = tempMod;
        this.color = color;
    }
    Season.get = function (days) {
        return Season.VALUES[(Math.floor(days / Season.DAYS_PER_SEASON) + Season.START) % Season.VALUES.length];
    };
    Season.DAYS_PER_SEASON = 4;
    Season.START = 1;
    Season.VALUES = [
        new Season('🌸', 'Early Spring', -0.2, '#80bf28'),
        new Season('🌸', 'Mid Spring', 0, '#80bf28'),
        new Season('🌸', 'Late Spring', 0.2, '#80bf28'),
        new Season('☀', 'Early Summer', 0.3, '#cc5d21'),
        new Season('☀', 'Mid Summer', 0.5, '#cc5d21'),
        new Season('☀', 'Late Summer', 0.3, '#cc5d21'),
        new Season('🍂', 'Early Fall', 0.2, '#8a8130'),
        new Season('🍂', 'Mid Fall', 0, '#8a8130'),
        new Season('🍂', 'Late Fall', 0.2, '#8a8130'),
        new Season('❄', 'Early Winter', -0.3, '#429ef5'),
        new Season('❄', 'Mid Winter', -0.5, '#429ef5'),
        new Season('❄', 'Late Winter', -0.3, '#429ef5')
    ];
    return Season;
}());
exports["default"] = Season;

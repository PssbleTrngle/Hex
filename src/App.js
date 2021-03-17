"use strict";
exports.__esModule = true;
var react_1 = require("react");
var Components_1 = require("./Components");
require("./App.css");
function App() {
    var search = window.location.search;
    var params = new URLSearchParams(search);
    var seed = parseInt(params.get('seed') || '');
    var scale = parseInt(params.get('scale') || '');
    var radius = parseInt(params.get('radius') || '');
    var randomize = params.get('gen') === 'random';
    var discover = params.get('mode') === 'discover';
    if (isNaN(radius))
        radius = 3;
    if (isNaN(seed))
        seed = Math.random();
    if (isNaN(scale))
        scale = 3;
    if (params.get('radius') === 'infinite')
        radius = Infinity;
    scale = Math.max(0.3, Math.min(10, scale));
    return (react_1["default"].createElement(Components_1.Game, { width: Math.floor(scale * 17), height: Math.floor(scale * 12), hexsize: 80 / scale, radius: radius, margin: 0, interval: 500, discover: discover, seed: seed }));
}
exports["default"] = App;

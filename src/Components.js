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
var react_1 = require("react");
var Pos_1 = require("./classes/Pos");
var Tiles_1 = require("./classes/Tiles");
var Tribe_1 = require("./classes/Tribe");
var Generator_1 = require("./classes/Generator");
var DisplayType_1 = require("./classes/DisplayType");
var react_twemoji_1 = require("react-twemoji");
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game(props, generator) {
        var _this = _super.call(this, props) || this;
        _this.generator = generator;
        _this.generator = new Generator_1.Generator(_this.props.seed, false);
        var tiles = new Tiles_1.Tiles(_this, _this.props.radius);
        for (var y = 0; y < _this.props.height; y++)
            for (var x = 0; x < _this.props.width; x++)
                tiles.add(new Pos_1.Pos(x - Math.floor(y / 2), y));
        _this.state = { focus: { pos: undefined, tile: undefined }, isNight: true, display: DisplayType_1.DISPLAY_TYPES[0], tiles: tiles, day: 0 };
        return _this;
    }
    Game.prototype.tick = function () {
        this.setState({ isNight: !this.state.isNight });
    };
    Game.prototype.componentDidMount = function () {
        this.state.tiles.tick(new Pos_1.Pos(0, 0), Infinity);
    };
    Game.prototype.focus = function (focus) {
        this.setState({ focus: focus });
    };
    Game.prototype.render = function () {
        return (react_1["default"].createElement("table", { className: 'container' },
            react_1["default"].createElement("tbody", null,
                react_1["default"].createElement("tr", null,
                    react_1["default"].createElement(GameField, { options: this.props, night: this.state.isNight, tiles: this.state.tiles, display: this.state.display, bar: this, focus: this.state.focus }),
                    react_1["default"].createElement(Sidebar, { options: this.props, tiles: this.state.tiles, display: this.state.display, focus: this.state.focus, container: this })))));
    };
    Game.prototype.componentDidUpdate = function () {
        this.state.tiles.resetChanges();
    };
    return Game;
}(react_1["default"].PureComponent));
exports.Game = Game;
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.render = function () {
        return (react_1["default"].createElement("button", { onClick: this.props.click, className: 'button' + (this.props.active ? ' active' : '') },
            react_1["default"].createElement(react_twemoji_1["default"], null, this.props.text)));
    };
    return Button;
}(react_1["default"].PureComponent));
exports.Button = Button;
var DisplayButtons = /** @class */ (function (_super) {
    __extends(DisplayButtons, _super);
    function DisplayButtons() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DisplayButtons.prototype.render = function () {
        var _this = this;
        return (react_1["default"].createElement("div", { className: 'button-bar' }, DisplayType_1.DISPLAY_TYPES.map(function (type, i) {
            return (react_1["default"].createElement(Button, { active: type === _this.props.active, key: type.icon, click: function () { return _this.props.container.setState({ display: type }); }, text: type.icon }));
        })));
    };
    return DisplayButtons;
}(react_1["default"].PureComponent));
exports.DisplayButtons = DisplayButtons;
var PlayButtons = /** @class */ (function (_super) {
    __extends(PlayButtons, _super);
    function PlayButtons(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { active: false, interval: undefined };
        return _this;
    }
    PlayButtons.prototype.toggle = function () {
        var active = !this.state.active && this.props.focus.pos !== undefined;
        var tick = function (button) {
            if (button.props.focus.pos)
                button.props.tiles.tick(button.props.focus.pos);
            else
                button.toggle();
        };
        if (active) {
            tick(this);
            this.setState({ interval: setInterval(tick, this.props.options.interval, this) });
        }
        else
            clearInterval(this.state.interval);
        this.setState({ active: active });
    };
    PlayButtons.prototype.render = function () {
        var _this = this;
        return (react_1["default"].createElement("div", { className: 'button-bar' },
            react_1["default"].createElement(Button, { active: this.state.active, click: function () { return _this.toggle(); }, text: this.state.active ? '⏸' : '▶' })));
    };
    return PlayButtons;
}(react_1["default"].Component));
exports.PlayButtons = PlayButtons;
var Sidebar = /** @class */ (function (_super) {
    __extends(Sidebar, _super);
    function Sidebar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Sidebar.prototype.render = function () {
        return (react_1["default"].createElement("td", { className: 'sidebar' },
            react_1["default"].createElement(PlayButtons, { tiles: this.props.tiles, focus: this.props.focus, options: this.props.options }),
            react_1["default"].createElement(DisplayButtons, { active: this.props.display, container: this.props.container }),
            this.props.focus.tile && this.props.focus.pos ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("h3", null,
                    "Day ",
                    this.props.focus.tile.day),
                react_1["default"].createElement("h3", null, this.props.focus.tile.season.name),
                react_1["default"].createElement("h3", null,
                    react_1["default"].createElement(react_twemoji_1["default"], null,
                        this.props.focus.tile.season.icon,
                        this.props.focus.tile.lunar.icon)),
                react_1["default"].createElement(Hex, { options: this.props.options, pos: this.props.focus.pos, display: this.props.display, tile: this.props.focus.tile, isFocus: true }),
                react_1["default"].createElement("h2", null, this.props.focus.tile.type.name),
                this.props.focus.tile.snowed ? (react_1["default"].createElement("p", null, "Snowed")) : null,
                this.props.focus.tile.taintProcess ? (react_1["default"].createElement("p", null,
                    this.props.focus.tile.taintProcess - 1,
                    " turn until tainted")) : null,
                this.props.focus.tile.detail ? (react_1["default"].createElement("p", null, this.props.focus.tile.detail.name)) : null,
                react_1["default"].createElement(react_twemoji_1["default"], null,
                    react_1["default"].createElement("p", null,
                        "\uD83C\uDF21 ",
                        this.props.focus.tile.temp.toFixed(2)),
                    react_1["default"].createElement("p", null,
                        "\u26A1 ",
                        this.props.focus.tile.energy.toFixed(2))),
                Array.from(this.props.focus.tile.tribes).map(function (_a) {
                    var tribe = _a[0], amount = _a[1];
                    return react_1["default"].createElement("p", { key: tribe.name },
                        amount,
                        " ",
                        tribe.name,
                        amount !== 1 ? 's' : '');
                }))) : null));
    };
    return Sidebar;
}(react_1["default"].Component));
exports.Sidebar = Sidebar;
var GameField = /** @class */ (function (_super) {
    __extends(GameField, _super);
    function GameField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameField.prototype.render = function () {
        var _this = this;
        var size = this.props.options.hexsize;
        return (react_1["default"].createElement("td", { className: 'gamefield-container' },
            react_1["default"].createElement("div", { className: 'gamefield ' + (this.props.night ? 'night' : 'day') },
                react_1["default"].createElement("div", null, this.props.tiles.map(function (tile, pos) {
                    return (react_1["default"].createElement(Hex, { options: _this.props.options, display: _this.props.display, key: pos.toString(), bar: _this.props.bar, tile: tile, pos: pos, tiles: _this.props.tiles, hover: pos.inHex(_this.props.focus.pos, _this.props.options.radius), focus: pos.isSame(_this.props.focus.pos) }));
                })),
                react_1["default"].createElement("div", { className: 'clouds' }, [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
                    return react_1["default"].createElement(Cloud, { key: i, size: size * (1 + Math.random() * 2), top: Math.random() * 100, delay: Math.random() * 20 });
                })),
                this.props.options.radius < Infinity && false ? react_1["default"].createElement(Focus, { options: this.props.options, pos: this.props.focus.pos, size: size }) : null)));
    };
    return GameField;
}(react_1["default"].Component));
exports.GameField = GameField;
var Cloud = /** @class */ (function (_super) {
    __extends(Cloud, _super);
    function Cloud() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Cloud.prototype.shouldComponentUpdate = function (nextProps) {
        return false;
    };
    Cloud.prototype.render = function () {
        return (react_1["default"].createElement("div", { className: 'hex cloud', style: {
                width: this.props.size / 1.15,
                height: this.props.size,
                top: this.props.top + '%',
                animationDelay: this.props.delay + 's'
            } }));
    };
    return Cloud;
}(react_1["default"].Component));
exports.Cloud = Cloud;
var DetailComponent = /** @class */ (function (_super) {
    __extends(DetailComponent, _super);
    function DetailComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DetailComponent.prototype.render = function () {
        if (!this.props.value)
            return null;
        var svg = this.props.value.icon();
        return (react_1["default"].createElement("div", { className: 'hex detail', style: {
                width: this.props.size * 60 + '%',
                height: this.props.size * 60 + '%',
                backgroundColor: svg ? 'transparent' : this.props.value.color
            } }, svg ? react_1["default"].createElement("img", { alt: this.props.value.name, draggable: false, src: require('./assets/' + svg.toString().toLowerCase() + '.svg') }) : null));
    };
    return DetailComponent;
}(react_1["default"].PureComponent));
exports.DetailComponent = DetailComponent;
var TribeSpot = /** @class */ (function (_super) {
    __extends(TribeSpot, _super);
    function TribeSpot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TribeSpot.prototype.render = function () {
        var i = this.props.index;
        var r = 30;
        return (react_1["default"].createElement("div", { className: 'tribe', style: {
                top: (50 - Math.sin(Math.PI * 6 / Tribe_1.Tribe.MAX * i) * r) + '%',
                left: (50 - Math.cos(Math.PI * 6 / Tribe_1.Tribe.MAX * i) * r * 1.15) + '%',
                backgroundColor: this.props.tribe.color
            } }));
    };
    return TribeSpot;
}(react_1["default"].PureComponent));
exports.TribeSpot = TribeSpot;
var Focus = /** @class */ (function (_super) {
    __extends(Focus, _super);
    function Focus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Focus.prototype.render = function () {
        if (!this.props.pos)
            return null;
        return (react_1["default"].createElement("div", { className: 'hex-focus', style: {
                width: this.props.size * (this.props.options.radius * 2),
                height: this.props.size * (this.props.options.radius * 2) / 1.15,
                top: (this.props.pos.isometric().y + 0.5) * (this.props.size / 1.37 + this.props.options.margin),
                left: (this.props.pos.isometric().x + 0.5) * (this.props.size / 1.19 + this.props.options.margin)
            } }));
    };
    return Focus;
}(react_1["default"].Component));
exports.Focus = Focus;
var Hex = /** @class */ (function (_super) {
    __extends(Hex, _super);
    function Hex(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClick = _this.handleClick.bind(_this);
        _this.state = {};
        return _this;
    }
    Hex.prototype.shouldComponentUpdate = function (nextProps) {
        if (this.props.isFocus)
            return true;
        if (nextProps.display !== this.props.display)
            return true;
        if (nextProps.hover !== this.props.hover)
            return true;
        if (nextProps.focus !== this.props.focus)
            return true;
        return nextProps.tile.changed === true;
    };
    Hex.prototype.handleClick = function () {
        if (this.props.isFocus)
            return;
        if (this.props.focus)
            return this.tick();
        if (this.props.bar)
            this.props.bar.focus(this.props);
    };
    Hex.prototype.tick = function () {
        if (!this.props.tiles)
            return;
        this.props.tiles.tick(this.props.pos, this.props.options.radius);
    };
    Hex.prototype.render = function () {
        var tile = this.props.tile;
        var undiscoverd = this.props.options.discover && tile.day < 2;
        var details = !undiscoverd && this.props.display.details;
        var color = undiscoverd ? undefined : this.props.display.color(tile, this.props.pos);
        var text = this.props.display.text(tile, this.props.pos);
        /* let index = Math.floor(noise.simplex2(this.props.pos.x, this.props.pos.y) * (Tribe.MAX - 1)); */
        var index = 0;
        var size = this.props.options.hexsize;
        return (react_1["default"].createElement("div", { onClick: this.handleClick, className: 'hex tile' + (this.props.isFocus ? ' focus' : '') + (this.props.hover ? ' hover' : '') + (tile.type.glowing ? ' glowing' : ''), style: !this.props.isFocus && size ? {
                top: this.props.pos.y * (size / 1.37 + this.props.options.margin),
                left: (this.props.pos.x + (this.props.pos.y / 2)) * (size / 1.19 + this.props.options.margin),
                width: size / 1.15,
                height: size,
                backgroundColor: color
            } : {
                backgroundColor: color
            } },
            Array.from(tile.tribes).map(function (_a) {
                var tribe = _a[0], amount = _a[1];
                if (!details)
                    return null;
                var tribes = [];
                for (var i = 0; i < amount; i++)
                    tribes.push(react_1["default"].createElement(TribeSpot, { index: index++, key: tribe + '_' + i, tribe: tribe }));
                return tribes;
            }),
            tile.detail && details ? react_1["default"].createElement(DetailComponent, { size: tile.detail.size(tile), value: tile.detail }) : null,
            !details && text !== null ? react_1["default"].createElement("p", null, text) : null));
    };
    return Hex;
}(react_1["default"].Component));
exports.Hex = Hex;

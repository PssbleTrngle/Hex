import {blend} from './colors.js';
import {noise} from './perlin.js';
import Tile from './Tile.js';

class DisplayType {

	icon;
	details;

	constructor(details, icon) {
		this.details = details;
		this.icon = icon;
	}

	color(tile, pos) { return null; }
	text(tile, pos) { return null; }

}

class Default extends DisplayType {

	color(tile, pos) {
		if(!tile.type) return null;

		if(tile.snowed) return blend('#EEE', '#DDD', Math.abs(noise.simplex2(pos.x * 10, pos.y * 10)));

		let s = 15;
		let r = Math.abs(noise.perlin2(pos.x / s, pos.y / s));
	
		let color = tile.type.getColor();
		if(Array.isArray(color)) return blend(color[0], color[1], r);
		return blend(color, '#000', Math.abs(noise.simplex2(pos.x * 10, pos.y * 10)) * 0.08);
	
	}

}

class Temp extends DisplayType {

	color(tile, pos) {

		let deg = 240 * (1 - (tile.getTemp() + 1) / 2);
		return 'hsl(' + deg + ', 90%, 40%)';

		let red = '#d12424';
		let blue = '#244fd1';

		return blend(blue, red, (tile.getTemp() + 1) / 2);
	}

}

class Energy extends DisplayType {

	color(tile, pos) {

		let blue = '#17fffb';
		return blend('#000', blue, tile.energy);
	
	}

}

class Season extends DisplayType {

	color(tile, pos) {
		return tile.season().color;
	}

	text(tile, pos) {
		return tile.day;
	}

}

class Time extends DisplayType {

	color(tile, pos) {

		let diff = tile.diff;
		let blue = '#17fffb';
		
		return blend('#333', blue, diff / Tile.MAX_DIFF);

	}

	text(tile, pos) {
		return tile.diff;
	}

}

var DISPLAY_TYPES = [
	new Default(true, '👁'),
	new Temp(false, '🌡'),
	new Energy(false, '💠'),
	new Season(false, '📅'),
	new Time(false, '🕗')
]


export default DISPLAY_TYPES;
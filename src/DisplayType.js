import {blend} from './colors.js';
import {noise} from './perlin.js';

class DisplayType {

	details;
	color;

	constructor(details) {
		this.details = details;
	}

}

class Default extends DisplayType {

	color(tile, pos) {

		if(tile.snowed) return blend('#EEE', '#DDD', Math.random());

		let s = 15;
		let r = Math.abs(noise.perlin2(pos.x / s, pos.y / s));
	
		let color = tile.type.getColor();
		if(Array.isArray(color)) return blend(color[0], color[1], r);
		return blend(color, '#000', Math.random() * 0.08);
	
	}

}

class Temp extends DisplayType {

	color(tile, pos) {

		let red = '#d12424';
		let blue = '#244fd1';

		return blend(blue, red, (tile.temp + 1) / 2);
	}

}

class DisplayTypes {

	static DEFAULT = new Default(true);
	static TEMP = new Temp(false);

}

export default DisplayTypes;
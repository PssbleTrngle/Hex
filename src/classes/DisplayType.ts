import {blend} from '../colors';
import Tile from './Tile';
import Pos from './Pos';

import OpenSimplexNoise from 'open-simplex-noise';

export abstract class DisplayType {

	constructor(public details: boolean, public icon: string) {}

	abstract color(tile: Tile, pos: Pos): string | undefined;
	text(tile: Tile, pos: Pos): string | undefined { return undefined; }

}

class Default extends DisplayType {

	noise = new OpenSimplexNoise(42);

	color(tile: Tile, pos: Pos): string | undefined {

		let noise = 0;

		let x = pos.x - Math.floor(pos.y / 2);
		let y = pos.y;

		let noNoise = false;
		let cleanNoise = false;

		let color: string[];
		if(tile.snowed) {

			let s = cleanNoise ? 10 : 1;
			color = ['#EEE', '#DDD'];
			noise = noNoise ? 0.5 : Math.abs(this.noise.noise2D(x / s, y / s));

		} else if(Array.isArray(tile.type.color)) {

			let s = 10;
			color = tile.type.color;
			noise = noNoise ? 0.5 : Math.abs(this.noise.noise2D(x / s, y / s));

		} else {

			let s = cleanNoise ? 10 : 1;
			color = [tile.type.color, '#000'];
			noise = noNoise ? 0 :Math.abs(this.noise.noise2D(x / s, y / s)) * (cleanNoise ? 0.2 : 0.12);

		}

		return blend(color[0], color[1], noise);	
	}

}

class Temp extends DisplayType {

	color(tile: Tile, pos: Pos): string | undefined {

		let deg = 240 * (1 - (tile.temp + 1) / 2);
		return 'hsl(' + deg + ', 90%, 40%)';

		/* Simply blend between red and blue
		let red = '#d12424';
		let blue = '#244fd1';

		return blend(blue, red, (tile.temp + 1) / 2);
		*/
	}

}

class Energy extends DisplayType {

	color(tile: Tile, pos: Pos): string | undefined {

		let blue = '#17fffb';
		return blend('#000', blue, tile.energy);
	
	}

}

class Season extends DisplayType {

	color(tile: Tile, pos: Pos): string | undefined {
		return tile.season.color;
	}

	text(tile: Tile, pos: Pos): string | undefined {
		return tile.day.toString();
	}

}

class Time extends DisplayType {

	color(tile: Tile, pos: Pos): string | undefined {

		let diff = tile.diff;
		let blue = '#17fffb';
		
		return blend('#333', blue, diff / Tile.MAX_DIFF);

	}

	text(tile: Tile, pos: Pos): string | undefined {
		return tile.diff  !==  0 ? tile.diff.toString() : undefined;
	}

}

export var DISPLAY_TYPES: DisplayType[] = [
	new Default(true, '👁'),
	new Temp(false, '🌡'),
	new Energy(false, '💠'),
	new Season(false, '📅'),
	new Time(false, '🕗')
]


export default DISPLAY_TYPES;
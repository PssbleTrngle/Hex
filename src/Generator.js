import Collection from './Collection.js';
import Pos from './Pos.js';
import Type from './Type.js';
import {Detail, Plant} from './Detail.js';
import {noise} from './perlin.js';

class TreeGenerator {

	generateAt(tile, x, y, random) {
		let s = 20;
		let r = Math.abs(noise.simplex2(x / s, y / s));

		if(tile.type == Type.GRASS) {
			if(r > 0.65) {
				tile.detail = Plant.TREE;
				tile.growth = Plant.TREE.max;
			}
		}

	}

}

class HolyGenerator {

	generateAt(tile, x, y, random) {
		let s = 40;
		let r = Math.abs(noise.simplex2(x / s, y / s));

		if(r > 0.9) {
			if(tile.type == Type.LAVA)
				tile.type = Type.NECTAR;
			else
				tile.type = Type.HOLY_LAND;

		}
		if(random > 0.8 && tile.type == Type.HOLY_LAND) {
			tile.detail = Plant.SACRED_OAK;
			tile.growth = 1;
		}

	}

}

class TaintGenerator {

	generateAt(tile, x, y, random) {
		let s = 40;
		let r = Math.abs(noise.simplex2(x / s, y / s));

		if(r > 0.9) {				
			if(tile.type == Type.WATER)
				tile.type = Type.POISON;
			else
				tile.type = Type.TAINT;
		}
	}

}

class TempGenerator {

	generateAt(tile, x, y, random) {
		
		let s = 30;
		tile.temp = (Math.abs(noise.simplex2(x / s, y / s)) * 2 - 0.6) * -0.7;

		s = 80;
		let extreme = Math.abs(noise.simplex2(x / s, y / s));
		extreme = Math.pow(extreme, 3);
		if(extreme > 0.2)
			tile.temp *= 3.2;

		tile.temp = Math.max(-1, Math.min(1, tile.temp));

	}

}

class SnowGenerator {

	generateAt(tile, x, y, random) {

		tile.snowed = tile.temp < -0.8 && tile.type != Type.WATER;

	}

}

class LavaGenerator {

	generateAt(tile, x, y, random) {
		if(tile.temp >= 0.97)
			tile.type = Type.LAVA;
	}

}

class GroundGenerator {

	standard = new Collection()
		.add(Type.GRASS, 1)
		.add(Type.DIRT, 0.2)
		.add(Type.STONE, 0.1)
		;

	hot = new Collection()
		.add(Type.VOLCANIC_ROCK, 1)
		.add(Type.ASH, 0.4)
		.add(Type.DIRT, 0.1)
		;

	cold = new Collection()
		.add(Type.DIRT, 1)
		;

	generateAt(tile, x, y, random) {

		let use = this.standard;
		if(tile.temp > 0.8) use = this.hot;
		else if(tile.temp < -0.8) use = this.cold;

		tile.type = use.get(random);

	}

}

class RiverGenerator {

	generateAt(tile, x, y, random) {

		let s = 20;
		let n = Math.abs(noise.perlin2(x / s, y / s));

		if(n < 0.06) {

			if(tile.temp > 0.8) tile.type = Type.VOLCANIC_SAND;
			else if(tile.temp < -0.8) tile.type = Type.ICE;
			else tile.type = Type.WATER;

		} else if(n < 0.1) {

			if(tile.temp > 0.8) tile.type = Type.VOLCANIC_SAND;
			else if(tile.temp > -0.5) tile.type = Type.SAND;
		}

	}

}

class Generator {

	generators = [];
	seed;

	random() {
	    let x = Math.sin(this.seed++) * 10000;
	    return x - Math.floor(x);
	}

	constructor(seed) {
		this.seed = seed;
		this.generators.push(new TempGenerator());
		this.generators.push(new GroundGenerator());
		this.generators.push(new RiverGenerator());
		this.generators.push(new LavaGenerator());
		this.generators.push(new TreeGenerator());
		this.generators.push(new TaintGenerator());
		this.generators.push(new HolyGenerator());
		this.generators.push(new SnowGenerator());
	}

	generate(tiles) {

		for(let gen of this.generators) {
			noise.seed(this.random());

		    for(let pos in tiles.tiles) {
		    	pos = Pos.from(pos);
				gen.generateAt(tiles.get(pos), pos.x, pos.y, this.random());
		    }
		}

		return tiles;

	}

}

export default Generator;
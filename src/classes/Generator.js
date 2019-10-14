import Collection from './Collection.js';
import Pos from './Pos.js';
import Tile from './Tile.js';
import Type from './Type.js';
import Details from './Detail.js';
import {noise} from '../perlin.js';

class TreeGenerator {

	generateAt(tile, x, y, random) {
		let s = 20;
		let r = Math.abs(noise.simplex2((x + y / 2) / s, y / s));

		if(tile.type == Type.GRASS) {
			if(r > 0.7 || tile.energy > 0.6) {
				tile.detail = Details.TREE;
				tile.growth = Details.TREE.max - Math.floor(random * 1.2);
				tile.growth = Math.max(1, tile.growth);
			}
		}

	}

}

class EnergyGenerator {

	times = 3;

	generateAt(tile, x, y, random) {

		if(!tile.energy) tile.energy = 0;

		let s = 40;
		let energy = Math.abs(noise.perlin2((x + y / 2) / s, y / s));
		energy = 1 - Math.sin(energy * Math.PI);
		energy = Math.pow(energy, 3) * 0.34;

		tile.energy = Math.max(0, Math.min(1, energy + tile.energy));

	}

}

class HolyGenerator {

	generateAt(tile, x, y, random) {

		if(tile.energy > 0.77) {
			if(tile.type == Type.LAVA)
				tile.type = Type.NECTAR;
			else
				tile.type = Type.HOLY_LAND;

			if(random > 0.8) {
				tile.detail = Details.SACRED_OAK;
				tile.growth = 1;
			}

		}

	}

}

class TaintGenerator {

	generateAt(tile, x, y, random) {
		let s = 40;
		let r = Math.abs(noise.simplex2((x + y / 2) / s, y / s));

		if(r > 0.8 && tile.temp < Tile.TAINT_TEMP) {

			if(random > 0.9)
				tile.detail = Details.RIFTS[0];

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
		tile.temp = (Math.abs(noise.simplex2((x + y / 2) / s, y / s)) * 2 - 0.6) * -0.7;

		s = 80;
		let extreme = Math.abs(noise.simplex2((x + y / 2) / s, y / s));
		extreme = Math.pow(extreme, 3);
		if(extreme > 0.2)
			tile.temp *= 3.2;

		tile.temp = Math.max(-1, Math.min(1, tile.temp));

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
		let n = Math.abs(noise.perlin2((x + y / 2) / s, y / s));

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

class MonsterGenerator {


	generateAt(tile, x, y, random) {

		if(random < 0.007)
			switch(tile.type) {
				case Type.GRASS:
				case Type.DIRT:
				case Type.SAND:
				case Type.MUD:
				case Type.VOLCANIC_ROCK:
				case Type.WATER:
				case Type.LAVA:
					tile.tribes['Monster'] = 1;

			}
	}

}

class HumanGenerator {

	generateAt(tile, x, y, random) {

		let s = 20;
		let n = Math.abs(noise.perlin2((x + y / 2) / s, y / s));
		
		if(n < 0.01 && tile.temp > 0)
			switch(tile.type) {
				case Type.GRASS:
				case Type.DIRT:
				case Type.SAND:
				case Type.MUD:

					if(random < 0.6)
						tile.tribes['Human'] = Math.floor(random * 10) % 2 + 1;
					else {
						tile.type = Type.FARMLAND;
						tile.detail = Details.WHEAT;
					}
			}

	}

}

class SpiritGenerator {

	generateAt(tile, x, y, random) {
		
		let barrier = 0.85;
		if(tile.energy > barrier && !tile.type.liquid)
			tile.tribes['Spirit'] = Math.floor(tile.energy / barrier * 2);

	}

}

class Generator {

	generators = [];
	seed;
	randomize;

	random() {
	    let x = Math.sin(this.seed++) * 10000;
	    return x - Math.floor(x);
	}

	constructor(seed, randomize) {
		this.seed = seed;
		this.randomize = randomize;

		this.generators.push(new TempGenerator());
		this.generators.push(new EnergyGenerator());

		this.generators.push(new GroundGenerator());
		this.generators.push(new RiverGenerator());
		this.generators.push(new LavaGenerator());

		this.generators.push(new TreeGenerator());

		this.generators.push(new TaintGenerator());
		this.generators.push(new HolyGenerator());

		this.generators.push(new HumanGenerator());
		this.generators.push(new SpiritGenerator());
		this.generators.push(new MonsterGenerator());
	}

	generate(tiles) {

		for(let gen of this.generators) {
			let times = 1;
			if(gen.times) times = gen.times;

			for(let i = 0; i < times; i++) {
				if(!this.randomize) noise.seed(this.random());

			    for(let pos in tiles.tiles) {
					if(this.randomize) noise.seed(this.random());
			    	pos = Pos.from(pos);
					gen.generateAt(tiles.get(pos), pos.x, pos.y, this.random());
			    }
			}
		}

		return tiles;

	}

}

export default Generator;
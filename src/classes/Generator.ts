import Collection from './Collection';
import Pos from './Pos';
import Tile from './Tile';
import Type from './Type';
import Tribe from './Tribe';
import Details from './Detail';

import OpenSimplexNoise from 'open-simplex-noise';

abstract class GeneratorPart {

	noise: any;

	seed(seed: any) {
		this.noise = new OpenSimplexNoise(seed * 12908);
	}

	abstract generateAt(tile: Tile, pos: Pos, random: number): void;

	get times(): number {
		return 1;
	}
}

class TreeGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {
		let s = 20;
		let r = Math.abs(this.noise.noise2D((pos.x + pos.y / 2) / s, pos.y / s));

		if(tile.type === Type.GRASS) {
			if(r > 0.7 || tile.energy > 0.6) {
				tile.detail = Details.TREE;
				tile.growth = Details.TREE.max - Math.floor(random * 1.2);
				tile.growth = Math.max(1, tile.growth);
			}
		}

	}

}

class EnergyGenerator extends GeneratorPart {

	get times(): number {
		return 3;
	}

	generateAt(tile: Tile, pos: Pos, random: number): void {

		if(!tile.energy) tile.energy = 0;

		let s = 40;
		let energy = Math.abs(this.noise.noise2D((pos.x + pos.y / 2) / s, pos.y / s));
		energy = 1 - Math.sin(energy * Math.PI);
		energy = Math.pow(energy, 3) * 0.34;

		tile.energy = Math.max(0, Math.min(1, energy + tile.energy));

	}

}

class HolyGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {

		if(tile.energy > 0.77) {
			if(tile.type === Type.LAVA)
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

class TaintGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {
		let s = 40;
		let r = Math.abs(this.noise.noise2D((pos.x + pos.y / 2) / s, pos.y / s));

		if(r > 0.8 && tile.temp < Tile.TAINT_TEMP) {

			if(random > 0.9)
				tile.detail = Details.RIFTS[0];

			if(tile.type === Type.WATER)
				tile.type = Type.POISON;
			else
				tile.type = Type.TAINT;
		}
	}

}

class TempGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {
		
		let s = 13;
		let temp = this.noise.noise2D((pos.x + pos.y / 2) / s, pos.y / s) / -0.8;
		tile.temp = Math.max(-1, Math.min(1, temp));

	}

}

class LavaGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {
		if(tile.temp >= 0.95)
			tile.type = Type.LAVA;
	}

}

class GroundGenerator extends GeneratorPart {

	standard = new Collection<Type>()
		.add(Type.GRASS, 1)
		.add(Type.DIRT, 0.2)
		.add(Type.STONE, 0.1)
		;

	hot = new Collection<Type>()
		.add(Type.VOLCANIC_ROCK, 1)
		.add(Type.ASH, 0.4)
		.add(Type.DIRT, 0.1)
		;

	cold = new Collection<Type>()
		.add(Type.DIRT, 1)
		;

	generateAt(tile: Tile, pos: Pos, random: number): void {

		let use = this.standard;
		if(tile.temp > 0.8) use = this.hot;
		else if(tile.temp < -0.8) use = this.cold;

		let type = use.get(random);
		tile.type = type ? type : Type.NULL;

	}

}

class RiverGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {

		let s = 30;
		let n = Math.abs(this.noise.noise2D((pos.x + pos.y / 2) / s, pos.y / s));

		if(n < 0.1) {

			if(tile.temp > 0.8) tile.type = Type.VOLCANIC_SAND;
			else if(tile.temp < -0.8) tile.type = Type.ICE;
			else tile.type = Type.WATER;

		} else if(n < 0.15) {

			if(tile.temp > 0.8) tile.type = Type.VOLCANIC_SAND;
			else if(tile.temp > -0.5) tile.type = Type.SAND;
		}

	}

}

class MonsterGenerator extends GeneratorPart {


	generateAt(tile: Tile, pos: Pos, random: number): void {

		if(random < 0.007)
			switch(tile.type) {
				case Type.GRASS:
				case Type.DIRT:
				case Type.SAND:
				case Type.MUD:
				case Type.VOLCANIC_ROCK:
				case Type.WATER:
				case Type.LAVA:
					tile.tribes.set(Tribe.MONSTERS, 1);
			}
	}

}

class HumanGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {

		let s = 20;
		let n = Math.abs(this.noise.noise2D((pos.x + pos.y / 2) / s, pos.y / s))
		
		if(n < 0.01 && tile.temp > 0)
			switch(tile.type) {
				case Type.GRASS:
				case Type.DIRT:
				case Type.SAND:
				case Type.MUD:

					if(random < 0.6)
						tile.tribes.set(Tribe.HUMANS, Math.floor(random * 10) % 2 + 1);
					else {
						tile.type = Type.FARMLAND;
						tile.detail = Details.WHEAT;
					}
			}

	}

}

class SpiritGenerator extends GeneratorPart {

	generateAt(tile: Tile, pos: Pos, random: number): void {
		
		let barrier = 0.85;
		if(tile.energy > barrier && !tile.type.liquid)
			tile.tribes.set(Tribe.SPIRITS, Math.floor(tile.energy / barrier * 2));

	}

}

export class Generator {

	generators: GeneratorPart[] = [];

	random(): number {
	    let x = Math.sin(this.seed++) * 10000;
	    return x - Math.floor(x);
	}

	constructor(private seed: number, private randomize: boolean) {
		this.generators.push(new TempGenerator());

		for(let i = 0; i < 3; i++)
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

		for(let gen of this.generators)
			gen.seed(this.random());
	}

	generateAt(tile: Tile, pos: Pos) {

		for(let gen of this.generators)
			gen.generateAt(tile, pos, this.random());

	}

}

export default Generator;
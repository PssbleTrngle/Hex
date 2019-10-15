import Pos from './Pos';
import {Details, Detail} from './Detail';
import Type from './Type';
import Lunar from './Lunar';
import Season from './Season';
import Tribe from './Tribe';
import Tiles from './Tiles';

export class Tile {

	static TAINT_TEMP = 0;
	static SNOW_TEMP = -0.6;
	static MAX_DIFF = 5;

	type: Type = Type.NULL;

	detail: Detail | undefined = undefined; 
	willBurn = false;
	growth = 0;
	beforeBurning: Detail | undefined = undefined

	warded = false;
	taintProcess: number | false = false;
	snowed = false;
	private _temp = 0;
	energy = 0;
	day = 0;
	diff = 0;
	changed = false;

	tribes = new Map<Tribe, number>();

	set temp(t: number) {
		this._temp = t;
	}

	get temp(): number {
		return Math.max(-1, Math.min(1, this._temp + this.season.tempMod));
	}

	get season(): Season {
		return Season.get(this.day);
	}

	get lunar(): Lunar {
		return Lunar.get(this.day);
	}

	addTribe(tribe: Tribe, amount: number = 1): void {

		let total = Object.values(this.tribes).reduce((prev, curr) => prev + curr, 0);

		if(total + amount <= Tribe.MAX) {

			let current: number = this.tribes.get(tribe) || 0;
			this.tribes.set(tribe, Math.max(0, current + amount));

		}
	}

	applyInfluences(neighboor: Tile) {

		for(let influence of this.type.influences) {
			if(influence.replace instanceof Type && influence.affect === neighboor.type) {
				neighboor.type = influence.replace;
				break;
			}
		}

	}

	clone(): Tile {
		let newTile = new Tile();
		Object.assign(newTile, this);
		return newTile;
	}

	updateDiff(tiles: Tiles, pos: Pos, justCollapsed = false) {
		let diff = 0;

		tiles.neighboors(pos).forEach((n, p) => diff = Math.max((n.day - this.day), diff))

		this.diff = diff;

		if(!justCollapsed && diff > Tile.MAX_DIFF)
			this.collapse(pos, tiles);
	}

	tick(tiles: Tiles, pos: Pos) {

		tiles.neighboors(pos).forEach((n, p) => {

			this.applyInfluences(n);

			if(this.type.tainted && n.temp < Tile.TAINT_TEMP && !n.taintProcess) {
				
				switch(n.type) {
					case Type.DIRT:
					case Type.GRASS:
					case Type.SAND:
					case Type.WATER:
						n.taintProcess = 1;
				}
			
			}

			if(this.type === Type.HOLY_LAND)
				n.warded = true;

		});

		if(this.warded && this.taintProcess)
			this.taintProcess = false;

		if(this.taintProcess === 1 && !this.warded) {

			if(this.type === Type.WATER)
				this.type = Type.POISON;
			else
				this.type = Type.TAINT;

			this.taintProcess = false;

		} else if(this.taintProcess)
			this.taintProcess--;

		if(this.type.tainted && this.detail)
			this.detail = this.detail.tainted;

		this.snowed = !this.type.liquid && this.type  !==  Type.ICE && this.temp < Tile.SNOW_TEMP;

		if(this.type === Type.WATER && this.temp < Tile.SNOW_TEMP)
			this.type = Type.ICE;
		if(this.type === Type.ICE && this.temp >= Tile.SNOW_TEMP)
			this.type = Type.WATER;

		if(this.detail)
			this.detail.tick(this, tiles, pos);

		this.tribes.forEach((amount, tribe) => {
			tribe.tick(tiles, pos, this);
		});
	}

	collapse(pos: Pos, tiles: Tiles) {

		let max = Number.MIN_SAFE_INTEGER;
		let min = Number.MAX_SAFE_INTEGER;

		tiles.neighboors(pos).forEach((n, p) => {
			let day = n.day;
			max = Math.max(max, day);
			min = Math.min(min, day);
		});

		let day = Math.floor((max + min) / 2);

		this.day = day;
		if(Math.random() < 0.1) {
			this.detail = Details.RIFTS[0];
			this.taintProcess = 1;
		}

		tiles.neighboors(pos, 1, true).forEach((n, p) => n.updateDiff(tiles, p, true));

	}

}

export default Tile;
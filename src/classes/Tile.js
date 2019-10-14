import Pos from './Pos.js';
import Details from './Detail.js';
import Type from './Type.js';
import Lunar from './Lunar.js';
import Season from './Season.js';
import Tribe from './Tribe.js';

class Tile {

	static TAINT_TEMP = 0;
	static SNOW_TEMP = -0.6;
	static MAX_DIFF = 5;

	constructor() {
		this.day = 0;
		this.diff = 0;
		this.tribes = {};
	}

	getTemp() {
		return Math.max(-1, Math.min(1, this.temp + this.season().tempMod));
	}

	season() {
		return Season.get(this.day);
	}

	lunar() {
		return Lunar.get(this.day);
	}

	addTribe(tribe, amount) {
		if(!isNaN(amount)) amount = 1;

		let total = 0;
		for(let tribe in this.tribes)
			total += this.tribes[tribe];

		if(total + amount <= Tribe.MAX) {

			let tribes = Object.assign({}, this.tribes);

			if(!tribes[tribe]) tribes[tribe] = 0;
			tribes[tribe] += amount;
			tribes[tribe] = Math.max(0, tribes[tribe]);

			this.set({tribes});
		}
	}

	applyInfluences(neighboor) {

		for(let influence of this.type.influences) {
			if(influence.affect === neighboor.type) {
				neighboor.set({type: influence.replace});
				break;
			} else if(influence.affect === neighboor.detail) {
				neighboor.set({detail: influence.replace});
				break;
			}
		}

	}

	clone() {
		let newTile = new Tile();
		Object.assign(newTile, this);
		return newTile;
	}

	updateDiff(tiles, pos, justCollapsed) {
		let diff = 0;

		let neighboors = tiles.neighboors(pos);

		for(let pos2 of neighboors) {
			let neighboor = tiles.get(pos2);

			diff = Math.max((neighboor.day - this.day), diff);
		}

		this.set({diff});

		if(!justCollapsed && diff > Tile.MAX_DIFF)
			this.collapse(pos, tiles);

		tiles.set(pos, this);
	}

	tick(tiles, pos) {

		let neighboors = tiles.neighboors(pos);

		for(let pos2 of neighboors) {
			let neighboor = tiles.get(pos2);

			this.applyInfluences(neighboor);

			if(this.type.tainted && neighboor.getTemp() < Tile.TAINT_TEMP && !neighboor.taintProcess) {
				
				switch(neighboor.type) {
					case Type.DIRT:
					case Type.GRASS:
					case Type.SAND:
					case Type.WATER:
						neighboor.set({taintProcess: 1});
				}
			
			}

			if(this.type == Type.HOLY_LAND)
				neighboor.set({warded: true});

			tiles.set(pos2, neighboor);

		}

		if(this.warded && this.taintProcess)
			this.set({taintProcess: null});

		if(this.taintProcess == 1 && !this.warded) {

			if(this.type == Type.WATER)
				this.set({type: Type.POISON, taintProcess: null});
			else
				this.set({type: Type.TAINT, taintProcess: null});

		} else if(this.taintProcess)
			this.set({taintProcess: this.taintProcess - 1});

		if(this.type.tainted && this.detail)
			this.set({detail: this.detail.tainted});

		this.set({snowed: !this.type.liquid && this.type != Type.ICE && this.getTemp() < Tile.SNOW_TEMP});

		if(this.type == Type.WATER && this.getTemp() < Tile.SNOW_TEMP)
			this.set({type: Type.ICE});
		if(this.type == Type.ICE && this.getTemp() >= Tile.SNOW_TEMP)
			this.set({type: Type.WATER});

		if(this.detail)
			this.detail.tick(this, tiles, pos);

		for(let tribe in this.tribes)
			Tribe.fromString(tribe).tick(tiles, pos, this);

		let seasonChanges = this.day % Season.DAYS_PER_SEASON == 0;
		tiles.set(pos, this);

	}

	collapse(pos, tiles) {

		let max = Number.MIN_SAFE_INTEGER;
		let min = Number.MAX_SAFE_INTEGER;
		for(let p of tiles.neighboors(pos)) {
			let day = tiles.get(p).day;
			max = Math.max(max, day);
			min = Math.min(min, day);
		}

		let day = Math.floor((max + min) / 2);

		this.set({day});
		if(Math.random() < 0.1)
			this.set({detail: Details.RIFTS[0], taintProcess: 1});

		for(let p of tiles.neighboors(pos, 1, true))
			tiles.get(p).updateDiff(tiles, p, true);
	}

	set(properties, noUpdate) {
		for(let key in properties) {
			let prop = properties[key];
			let changed = this[key] != prop;
			this.update = this.update || (changed && !noUpdate);
			this.changed = this.changed || changed;
			this[key] = prop;
		}
	}

}

export default Tile;
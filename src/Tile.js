import Pos from './Pos.js';
import Detail from './Detail.js';
import Type from './Type.js';
import Season from './Season.js';

class Tile {

	static TAINT_TEMP = 0;
	static SNOW_TEMP = -0.6;
	day = 1;

	getTemp() {
		return Math.max(-1, Math.min(1, this.temp + this.season().tempMod));
	}

	season() {
		return Season.get(this.day);
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

	tick(tiles, pos) {
		this.day++;

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

		if(this.detail)
			this.detail.tick(this, tiles, pos);

		if(this.type.tainted && this.detail)
			this.set({detail: this.detail.tainted});

		this.set({snowed: !this.type.liquid && this.type != Type.ICE && this.getTemp() < Tile.SNOW_TEMP});

		if(this.type == Type.WATER && this.getTemp() < Tile.SNOW_TEMP)
			this.set({type: Type.ICE})
		if(this.type == Type.ICE && this.getTemp() >= Tile.SNOW_TEMP)
			this.set({type: Type.WATER})

		let seasonChanges = this.day % Season.DAYS_PER_SEASON == 0;
		this.set({day: this.day}, !seasonChanges);
		tiles.set(pos, this);

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
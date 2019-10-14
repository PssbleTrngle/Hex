import Type from './Type.js';
import Tribe from './Tribe.js';

export class Detail {

	color;
	tainted = this;

	constructor(color, name) {
		this.name = name;
		this.color = color;
	}

	getColor() {
		return this.color;
	}

	tick(tiles, pos) {}

	size(tile) {
		return 1;
	}

	setTainted(tainted) {
		this.tainted = tainted;
		return this;
	}

	icon() { return null }

}

export class Rift extends Detail {

	static USE_SVG = true;

	icon() {
		if(!Rift.USE_SVG) return null;
		return this.name;
	}

	constructor(color, riftSize, name) {
		super(color, name);

		this.riftSize = riftSize;
	}

	tick(tile, tiles, pos) {

		if(tile.lunar().growRift)
			this.grow(tile);

	}

	grow(tile) {

		let next = Details.RIFTS[Math.min(this.riftSize, Details.RIFTS.length - 1)];
		tile.set({detail: next});

		tile.addTribe(Tribe.fromString('demon'), Math.floor(this.riftSize / 2));

	}

	size(tile) {
		if(Rift.USE_SVG)
			return 0.6 + 0.4 * this.size;
		return this.riftSize / 4;
	}

}

export class Plant extends Detail {

	constructor(color, max, name, fireResistant) {
		super(color, name);

		this.canBurn = !fireResistant;
		this.max = max;
	}

	burnedVersion() {
		return Details.BURNING_TREE;
	}

	deadVersion() {
		return Details.DEAD_TREE;
	}

	taintedVersion() {
		return this.deadVersion();
	}

	grow(tile) {
		if(tile.growth < this.max)
			tile.set({growth: tile.growth + 1});
	}

	tick(tile, tiles, pos) {
		this.grow(tile);

		if(this.canBurn && (Math.random() * tile.getTemp() > 0.7 || tile.willBurn)) 
			tile.set({detail: this.burnedVersion(), willBurn: false, beforeBurning: this});

		if(this === Details.BURNING_TREE) {

			if(tile.beforeBurning && tile.temp < 0.8 && Math.random() < 0.5)
				tile.set({detail: tile.beforeBurning});
			else {

				for(let p of tiles.neighboors(pos)) {
					let neighboor = tiles.get(p);
					if(neighboor.detail && neighboor.detail.canBurn)
						neighboor.set({willBurn: true});
				}

				tile.set({detail: this.deadVersion()});

			}

		}

	}

	size(tile) {
		return tile.growth / this.max;
	}

}

class Crop extends Plant {

	burnedVersion() {
		return Details.BURNING_CROPS;
	}

	deadVersion() {
		return Details.BURNED_CROPS;
	}

	tick(tile, tiles, pos) {
		this.grow(tile);
	}

	size() {
		return 0.8;
	}

}

class SacredTree extends Plant {

	constructor(color, max, name) {
		super(color, max, name, true);
	}

	tick(tile, tiles, pos) {
		this.grow(tile);

		if(tile.growth == this.max) {
			for(let pos2 of tiles.neighboors(pos)) {

				let neighboor = tiles.get(pos2);

				if(neighboor.type.tainted)
					neighboor.set(pos2, {type: Type.DIRT});
				else if(neighboor.type === Type.DIRT)
					neighboor.set({type: Type.GRASS});
				else
					neighboor.set({type: Type.HOLY_LAND});	

				tiles.set(pos2, neighboor);
			}

			tile.set({type: Type.HOLY_LAND});
		}

	}

	size(tile) {
		return super.size(tile) * 1.2;
	}

}

class Details {

	static ROCK = new Detail('#9e928c', 'Rock');

	static TREE = 			new Plant('#2b6b1a', 4, 'Tree').setTainted(Details.DEAD_TREE);
	static BURNING_TREE = 	new Plant('#e83023', 4, 'Burning Tree');
	static DEAD_TREE = 		new Plant('#5c5141', 4, 'Dead Tree', true);

	static SACRED_OAK = new SacredTree('#945207', 8, 'Sacred Oak');

	static RIFTS = [
		new Rift('#000', 1, 'Breach'),
		new Rift('#000', 2, 'Rift'),
		new Rift('#000', 3, 'Portal'),
		new Rift('#000', 4, 'Gateway')
	];

	static WHEAT = new Crop('#c9b169', 3, 'Wheat');

	static BURNING_CROPS = new Crop('#e83023', 3, 'Burning Crops');
	static BURNED_CROPS = new Crop('#5c5141', 3, 'Burned Crops');

}

export default Details;
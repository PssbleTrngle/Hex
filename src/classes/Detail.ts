import Type from './Type';
import Tribe from './Tribe';
import Pos from './Pos';
import Tiles from './Tiles';
import { Set, Tile } from './Tile';

export class Detail {

	canBurn: boolean = false;

	private _tainted: Detail | undefined = undefined;

	get tainted() {
		return this._tainted || this;
	}

	constructor(public color: string, public name: string) {}

	tick(tiles: Tiles, pos: Pos, tile: Set): void {}

	size(tile: Tile): number {
		return 1;
	}

	setTainted(tainted: Detail): Detail {
		this._tainted = tainted;
		return this;
	}

	icon(): string | undefined { return undefined }

}

export class Rift extends Detail {

	static USE_SVG = true;

	icon(): string | undefined {
		if(!Rift.USE_SVG) return super.icon();
		return this.name;
	}

	constructor(color: string, public riftSize: number, name: string) {
		super(color, name);
	}

	tick(tiles: Tiles, pos: Pos, tile: Set): void {

		if(tile.get.lunar.growRift)
			this.grow(tile.set);

	}

	grow(tile: Tile): void {

		let next = Details.RIFTS[Math.min(this.riftSize, Details.RIFTS.length - 1)];
		tile.detail = next;

		tile.addTribe(Tribe.DEMONS, Math.floor(this.riftSize / 2));

	}

	size(tile: Tile): number {
		if(Rift.USE_SVG)
			return 0.6 + 0.4 * this.riftSize;
		return this.riftSize / 4;
	}

}

export class Plant extends Detail {

	constructor(color: string, public max: number, name: string, fireResistant: boolean = false) {
		super(color, name);
		this.canBurn = !fireResistant;
	}

	get burnedVersion(): Detail {
		return Details.BURNING_TREE;
	}

	get deadVersion(): Detail {
		return Details.DEAD_TREE;
	}

	get taintedVersion(): Detail {
		return this.deadVersion;
	}

	setTainted(tainted: Detail): Plant {
		super.setTainted(tainted);
		return this;
	}

	grow(tile: Tile): void {
		if(tile.growth < this.max)
			tile.growth++;
	}

	tick(tiles: Tiles, pos: Pos, tile: Set) {
		this.grow(tile.set);

		if(this.canBurn && (Math.random() * tile.get.temp > 0.7 || tile.get.willBurn)) {
			tile.set.detail = this.burnedVersion;
			tile.set.willBurn = false;
			tile.set.beforeBurning = this;
		}

		if(this === Details.BURNING_TREE) {

			if(tile.get.beforeBurning && tile.get.temp < 0.8 && Math.random() < 0.5)
				tile.set.detail = tile.get.beforeBurning;
			else {

				tiles.neighboors(pos).forEach((n, p) => {
					if(n && n.detail && n.detail.canBurn)
						n.willBurn = true;
				});

				tile.set.detail = this.deadVersion;

			}

		}

	}

	size(tile: Tile): number {
		return tile.growth / this.max;
	}

}

class Crop extends Plant {

	get burnedVersion(): Detail {
		return Details.BURNING_CROPS;
	}

	get deadVersion(): Detail {
		return Details.BURNED_CROPS;
	}

	size(): number {
		return 0.8;
	}

}

class SacredTree extends Plant {

	constructor(color: string, max: number, name: string) {
		super(color, max, name, true);
	}

	tick(tiles: Tiles, pos: Pos, tile: Set) {
		super.tick(tiles, pos, tile);

		if(tile.get.growth === this.max) {

			tiles.neighboors(pos).forEach((n, p) => {

				if(n.type.tainted)
					n.type = Type.DIRT;
				else if(n.type === Type.DIRT)
					n.type = Type.GRASS;
				else
					n.type = Type.HOLY_LAND;

			});

			tile.set.type = Type.HOLY_LAND;
		}

	}

	size(tile: Tile): number {
		return super.size(tile) * 1.2;
	}

}

export class Details {

	static ROCK = new Detail('#9e928c', 'Rock');

	static DEAD_TREE = 		new Plant('#5c5141', 4, 'Dead Tree', true);
	static TREE = 			new Plant('#2b6b1a', 4, 'Tree').setTainted(Details.DEAD_TREE);
	static BURNING_TREE = 	new Plant('#e83023', 4, 'Burning Tree');

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
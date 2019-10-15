import Pos from './Pos';
import Tile from './Tile';
import Generator from './Generator';

interface container {
	tick(): void;
	generator: Generator;
	state: {isNight: boolean};
}

export class Tiles {

	private changed = new Map<Pos, Tile>();

	constructor(private container: container & React.Component, private radius: number, private tiles = new Map<Pos, Tile>()) {}

	forEach(func: (t: Tile, p: Pos) => void): void {
		this.tiles.forEach(func);
	}

	map<U>(func: (t: Tile, p: Pos) => U): U[] {
		let u: U[] = [];
		this.tiles.forEach((tile, pos) => {
			u.push(func(tile, pos));
		})
		return u;
	}

	get(pos: Pos): Tile | undefined {
		let tile = this.tiles.get(pos);
		return tile ? tile.clone() : undefined;
	}

	apply() {

		this.tiles.forEach((tile, pos) => {
			let changed = this.changed.get(pos);
			if(changed) this.tiles.set(pos, changed);
		});

		if(this.container)
			this.container.setState({tiles: this.clone()});
	}

	tick(pos: Pos, radius = this.radius) {
		this.resetChanges();
		if(this.container)
			this.container.tick();

		let next = this.clone();

		let neighboors = next.neighboors(pos, radius, true);
		let largerNeighboors = next.neighboors(pos, radius + 1, true);

		//increment day
		neighboors.forEach((n, p) => {
	    	n.day++;
	    	n.changed = true;
		});

	    //update diff
	    largerNeighboors.forEach((n, p) =>  n.updateDiff(next, p));

	    //tick

		neighboors.forEach((n, p) => {
    		let c = n.clone();
    		c.tick(next, p);
    		this.changed.set(p, c);
		});

	    next.apply();
	}

	resetChanges() {
		this.tiles.forEach((tile, pos) => { tile.changed = false; });
		this.changed = new Map();
	}

	clone(): Tiles {
		let tiles = new Map(this.tiles);
		return new Tiles(this.container, this.radius, tiles);
	}

	add(pos: Pos): void {
		let tile = new Tile();
		this.container.generator.generateAt(tile, pos);
		this.tiles.set(pos, tile);
	}

	neighboors(center: Pos, radius = 1, addCenter = false): Map<Pos, Tile> {

		let map = new Map(this.tiles);

		if(radius < Infinity) 
			for(let key of Array.from(this.tiles.keys()).filter(pos => {
				return !(pos.inHex(center, radius) && (addCenter || !center.isSame(pos)));
			})) map.delete(key);

		return map;
	}

	get night(): boolean {
		return this.container.state.isNight;
	}

}

export default Tiles;
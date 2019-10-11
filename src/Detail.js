import Type from './Type.js';

export class Detail {

	static ROCK = new Detail('#9e928c');

	color;
	tainted = this;

	constructor(color) {
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

}

export class Plant extends Detail {

	max = 1;

	static DEAD_TREE = 	new Plant('#5c5141', 3);
	static TREE = 		new Plant('#2b6b1a', 3).setTainted(Plant.DEAD_TREE);
	static SACRED_OAK = new Plant('#945207', 3);

	constructor(color, max) {
		super(color);

		this.max = max;
	}

	tick(tile, tiles, pos) {

		if(tile.growth < this.max)
			tile.set({growth: tile.growth + 1});

		if(this == Plant.SACRED_OAK) {
			
			for(let pos2 of tiles.neighboors(pos)) {

				let neighboor = tiles.get(pos2);

				if(neighboor.type.tainted)
					neighboor.set(pos2, {type: Type.DIRT});
				else if(neighboor.type == Type.DIRT)
					neighboor.set({type: Type.GRASS});
				else
					neighboor.set({type: Type.HOLY_LAND});	

				tiles.set(pos2, neighboor);
			}

			tile.set({type: Type.HOLY_LAND});
		}
	}

	size(tile) {
		return tile.growth / this.max;
	}

}

export default Detail;
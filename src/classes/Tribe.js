import Pos from './Pos.js';

class Tribe {

	static VALUES = [
		new Tribe('#3957c4', 'Human', (tiles, pos, tile) => 1),
		new Tribe('#4ecdde', 'Spirit'),
		new Tribe('#993fd9', 'Demon'),
		new Tribe('#bf1717', 'Monster')
	]

	static MAX = 8;

	color;
	name;

	tick(tiles, pos, tile) {
		let amount = this.grow(tiles, pos, tile);
		if(amount)
			tile.addTribe(this, amount);
	}

	constructor(color, name, grow) {
		this.color = color;
		this.name = name;
		this.grow = grow ? grow : () => false;
	}

	toString() {
		return this.name;
	}

	static fromString(string) {
		for(let tribe of Tribe.VALUES) 
			if(tribe.name.toLowerCase() == string.toLowerCase())
				return tribe;
		return null;
	}

}

export default Tribe;
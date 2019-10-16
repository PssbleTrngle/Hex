import { Tile, Set } from './Tile';
import { Tiles } from './Tiles';
import { Pos } from './Pos';

export class Tribe {

	static HUMANS = new Tribe('#3957c4', 'Human', (tiles, pos, tile) => 1);
	static SPIRITS = new Tribe('#4ecdde', 'Spirit');
	static DEMONS = new Tribe('#993fd9', 'Demon');
	static MONSTERS = new Tribe('#bf1717', 'Monster');

	static MAX = 8;

	tick(tiles: Tiles, pos: Pos, tile: Set) {
		let amount = this.grow(tiles, pos, tile);
		if(amount)
			tile.set.addTribe(this, amount);
	}

	constructor(public color: string, public name: string, public grow: (ts: Tiles, p: Pos, t: Set) => number | false = () => false) {}

	toString(): string {
		return this.name;
	}

}

export default Tribe;
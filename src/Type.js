import Pos from './Pos.js';
import Detail from './Detail.js';

class Type {

	static GRASS =  		new Type('#54b830', 'Grass');
	static DIRT =  			new Type('#8f642c', 'Dirt');
	static STONE =  		new Type('#9e928c', 'Stone');
	static MUD =  			new Type('#7a5727', 'Mud');
	static SAND =  			new Type('#e0d284', 'Sand');

	static TAINT =  		new Type('#a569af', 'Taint').isTainted();
	static POISON =  		new Type(["#a58ecc", "#c084e8"], 'Poison').isTainted();

	static HOLY_LAND =  	new Type('#dfef39', 'Holy Land')
									.influence([Type.POISON], Type.WATER)
									.influence([Type.TAINT], Type.DIRT);
	static NECTAR =  		new Type(["#f9c909", "#f9ad09"], 'Nectar');
	static VOLCANIC_ROCK =  new Type('#513227', 'Volcanic Rock');
	static ASH =  			new Type('#544c49', 'Ash');
	static VOLCANIC_SAND =  new Type('#b5a96a', 'Volcanic Sand');
	static ICE =  			new Type('#a8cbdb', 'Ice');

	static LAVA =  			new Type(["#f44122", "#ff932d"], 'Lava')
									.influence([Type.GRASS], Type.DIRT)
									.influence([Type.MUD], Type.DIRT)
									.influence([Type.DIRT], Type.ASH)
									.influence([Detail.TREE], null);

	static WATER =  		new Type(["#48abc4", "#2066ab"], 'Water')
									.influence([Type.DIRT], Type.MUD)
									.influence([Type.MUD], Type.GRASS)
									.influence([Type.MUD], Type.GRASS)
									.influence([Type.LAVA], Type.VOLCANIC_ROCK);

	tainted = false;
	color; 
	name;
	influences = [];

	static tick(tiles, pos) {

		let tile = tiles.get(pos);

		let neighboors = tiles.neighboors(pos);

		for(let pos2 of neighboors) {
			let neighboor = tiles.get(pos2);

			for(let influence of tile.type.influences) {
				if(influence.affect === neighboor.type) {
					tiles.set(pos2, {type: influence.replace});
					break;
				} else if(influence.affect === neighboor.detail) {
					tiles.set(pos2, {detail: influence.replace});
					break;
				}
			}

			if(tile.type.tainted && !neighboor.taintProcess) {
				
				switch(neighboor.type) {
					case Type.DIRT:
					case Type.GRASS:
					case Type.WATER:
						tiles.set(pos2, {taintProcess: 1});
				}
			
			}

			if(tile.type == Type.HOLY_LAND)
				tiles.set(pos2, {warded: true});

		}

		if(tile.warded && tile.taintProcess)
			tiles.set(pos, {taintProcess: null});

		if(tile.taintProcess == 1 && !tile.warded) {

			if(tile.type == Type.WATER)
				tiles.set(pos, {type: Type.POISON, taintProcess: null});
			else
				tiles.set(pos, {type: Type.TAINT, taintProcess: null});

		} else if(tile.taintProcess)
			tiles.set(pos, {taintProcess: tile.taintProcess - 1});

		if(tile.detail)
			tile.detail.tick(tiles, pos);

		if(tile.type.tainted && tile.detail) tiles.set(pos, {detail: tile.detail.tainted});

	}

	constructor(color, name) {
		this.color = color;
		this.name = name;
	}

	getColor() {
		return this.color;
	}

	influence(affects, replace) {
		for(let affect of affects)
			this.influences.push({affect, replace});
		return this;
	}

	isTainted() {
		this.tainted = true;
		return this;
	}

}

export default Type;
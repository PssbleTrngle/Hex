import Pos from './Pos.js';
import Details from './Detail.js';

class Type {

	static GRASS =  		new Type('#54b830', 'Grass');
	static DIRT =  			new Type('#8f642c', 'Dirt');
	static STONE =  		new Type('#9e928c', 'Stone');
	static MUD =  			new Type('#7a5727', 'Mud');
	static SAND =  			new Type('#e0d284', 'Sand');

	static TAINT =  		new Type('#a569af', 'Taint').isTainted();
	static POISON =  		new Type(["#a58ecc", "#d684e8"], 'Poison').isTainted().isLiquid();

	static HOLY_LAND =  	new Type('#dfef39', 'Holy Land')
									.influence([Type.POISON], Type.WATER)
									.influence([Type.TAINT], Type.DIRT);
	static NECTAR =  		new Type(["#f9c909", "#f9ad09"], 'Nectar');
	static VOLCANIC_ROCK =  new Type('#513227', 'Volcanic Rock');
	static ASH =  			new Type('#544c49', 'Ash');
	static VOLCANIC_SAND =  new Type('#b5a96a', 'Volcanic Sand');
	static ICE =  			new Type('#a8cbdb', 'Ice');

	static LAVA =  			new Type(["#f44122", "#ff932d"], 'Lava').isLiquid().isGlowing()
									.influence([Type.GRASS], Type.DIRT)
									.influence([Type.MUD], Type.DIRT)
									.influence([Type.DIRT], Type.ASH)
									.influence([Details.TREE], null);

	static WATER =  		new Type(["#48abc4", "#2066ab"], 'Water').isLiquid()
									.influence([Type.DIRT], Type.MUD)
									.influence([Type.MUD], Type.GRASS)
									.influence([Type.MUD], Type.GRASS)
									.influence([Type.LAVA], Type.VOLCANIC_ROCK);

	static FARMLAND =  			new Type('#7a5727', 'Farmland');

	tainted = false;
	color; 
	name;
	influences = [];

	constructor(color, name) {
		this.color = color;
		this.name = name;
		this.liquid = false;
		this.glowing = false;
	}

	isLiquid() {
		this.liquid = true;
		return this;
	}

	isGlowing() {
		this.glowing = true;
		return this;
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
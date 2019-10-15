class Type {

	static NULL =			new Type('#000000', 'NULL');

	static GRASS =  		new Type('#54b830', 'Grass');
	static DIRT =  			new Type('#8f642c', 'Dirt');
	static STONE =  		new Type('#9e928c', 'Stone');
	static MUD =  			new Type('#7a5727', 'Mud');
	static SAND =  			new Type('#e0d284', 'Sand');

	static VOLCANIC_ROCK =  new Type('#513227', 'Volcanic Rock');
	static ASH =  			new Type('#544c49', 'Ash');
	static VOLCANIC_SAND =  new Type('#b5a96a', 'Volcanic Sand');
	static ICE =  			new Type('#a8cbdb', 'Ice');

	static LAVA =  			new Type(["#f44122", "#ff932d"], 'Lava').isLiquid().isGlowing()
									.influence([Type.GRASS], Type.DIRT)
									.influence([Type.MUD], Type.DIRT)
									.influence([Type.DIRT], Type.ASH);

	static WATER =  		new Type(["#48abc4", "#2066ab"], 'Water').isLiquid()
									.influence([Type.DIRT], Type.MUD)
									.influence([Type.MUD], Type.GRASS)
									.influence([Type.MUD], Type.GRASS)
									.influence([Type.LAVA], Type.VOLCANIC_ROCK);

	static TAINT =  		new Type('#a569af', 'Taint').isTainted();
	static POISON =  		new Type(["#a58ecc", "#d684e8"], 'Poison').isTainted().isLiquid();

	static HOLY_LAND =  	new Type('#dfef39', 'Holy Land')
									.influence([Type.POISON], Type.WATER)
									.influence([Type.TAINT], Type.DIRT);
	static NECTAR =  		new Type(["#f9c909", "#f9ad09"], 'Nectar');

	static FARMLAND =  		new Type('#7a5727', 'Farmland');

	liquid = false;
	glowing = false;
	tainted = false;
	influences: {affect: Type, replace: Type}[] = [];

	constructor(private _color: string | string[], public name: string) {}

	isLiquid(): Type {
		this.liquid = true;
		return this;
	}

	isGlowing(): Type {
		this.glowing = true;
		return this;
	}

	get color(): string | string[] {
		return this._color;
	}

	influence(affects: Type[], replace: Type): Type {
		for(let affect of affects)
			this.influences.push({affect, replace});
		return this;
	}

	isTainted(): Type {
		this.tainted = true;
		return this;
	}

}

export default Type;
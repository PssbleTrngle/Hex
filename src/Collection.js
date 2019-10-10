class Collection {

	map = [];
	total = 0;

	add(value, chance) {

		this.map.push({value, chance});
		this.total += chance;
		return this;

	}

	get(random) {

		random *= this.total;

		let t = 0;
		for(let entry of this.map) {

			t += entry.chance;
			if(t >= random) return entry.value;

		}

	}

}

export default Collection;
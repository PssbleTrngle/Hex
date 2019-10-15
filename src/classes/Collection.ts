class Collection<T> {

	private map: {value: T, chance: number}[] = [];
	private total = 0;

	add(value: T, chance: number) {
		this.map.push({value, chance});
		this.total += chance;
		return this;

	}

	get(random: number = Math.random()): T | null {

		random *= this.total;

		let t = 0;
		for(let entry of this.map) {

			t += entry.chance;
			if(t >= random) return entry.value;

		}

		return null;

	}

}

export default Collection;
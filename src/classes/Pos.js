class Pos {

	x; y;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	toString() {
		return this.x + ':' + this.y;
	}

	static from(string) {
		let x = parseInt(string.split(':')[0]);
		let y = parseInt(string.split(':')[1]);
		return new Pos(x, y);
	}

	isSame(pos) {
		return pos && pos.x == this.x && pos.y == this.y;
	}

	inHex(pos, radius) {
		if(!pos) return false;
		if(!radius) radius = 1;
		if(radius == Infinity) return this.isSame(pos);

		let x = pos.x - this.x;
		let y = pos.y - this.y;

		return (Math.abs(x + y) <= radius) && Math.abs(y) <= radius && Math.abs(x) <= radius;

	}

}

export default Pos;
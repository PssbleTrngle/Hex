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

}

export default Pos;
export class Pos {

	constructor(public x: number, public y: number) {}

	toString(): string {
		return this.x + ':' + this.y;
	}

	static from(string: string): Pos {
		let x = parseInt(string.split(':')[0]);
		let y = parseInt(string.split(':')[1]);
		return new Pos(x, y);
	}

	isSame(pos: Pos | undefined): boolean {
		return pos !== undefined && pos.x === this.x && pos.y === this.y;
	}

	inHex(pos: Pos | undefined, radius: number = 1): boolean {
		if(pos === undefined) return false;
		if(radius === Infinity) return this.isSame(pos);

		let x = pos.x - this.x;
		let y = pos.y - this.y;

		return (Math.abs(x + y) <= radius) && Math.abs(y) <= radius && Math.abs(x) <= radius;

	}

}

export default Pos;
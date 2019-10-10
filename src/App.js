import React from 'react';
import './App.css';
import Type from './Type.js';
import Pos from './Pos.js';
import Generator from './Generator'
import DisplayTypes from './DisplayType'

var TICK_RADIUS = Infinity;
var TILE_MARGIN = 0;

function App() {
  return (<Container />);
}

class Container extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {focus: {}};
	}

	focus(tile, pos) {
		//this.setState({focus: {}});
	}

	render() {
		return (
		  	<table className='container'><tbody><tr>
			    <GameField width={70} height={40} bar={this} focus={this.state.focus.pos} />
			  	<Sidebar tile={this.state.focus.tile} />
		  	</tr></tbody></table>
		);
	}

}

class Tiles {

	tiles = {};
	changed = {};

	constructor(tiles) {
		this.tiles = tiles;
	}

  get(pos) {
  	return this.tiles[pos];
  }

  set(pos, tile) {
  	tile = Object.assign({}, tile);
  	tile.changed = true;
  	if(!this.changed[pos]) this.changed[pos] = {};
	Object.assign(this.changed[pos], tile);
  }

  apply() {
  	for(let pos in this.changed) {
  		this.tiles[pos] = Object.assign(Object.assign({}, this.tiles[pos]), this.changed[pos]);
  	}
  }

  nextTick() {
  	for(let pos in this.tiles)
		this.tiles[pos].changed = false;
  }

  clone() {
	let tiles = Object.assign({}, this.tiles);
	return new Tiles(tiles);
  }

  add(pos){
  	this.tiles[pos] = {};
  }

	neighboors(pos, radius) {
		if(!radius) radius = 1;

		let neighboors = [];

		if(radius == Infinity)
			for(let pos in this.tiles)
				neighboors.push(Pos.from(pos))

		else
			for(let x = -radius; x <= radius; x++)
				for(let y = -radius; y <= radius; y++)
					if(Math.abs(x + y) <= radius) {
						let pos2 = new Pos(pos.x + x, pos.y + y);
						let neighboor = this.get(pos2)
						if(neighboor)
							neighboors.push(pos2);
					}

		return neighboors;

	}

}

class Sidebar extends React.PureComponent {

	render() {
		if(!this.props.tile) return null;
		return (
			<td className='sidebar'>
				<Hex tile={this.props.tile} isFocus={true}/>
				<h2>{this.props.tile.type.name}</h2>
				{this.props.tile.snowed ? (<p>Snowed</p>) : null}
				{this.props.tile.taintProcess ? (<p>{this.props.tile.taintProcess - 1} turn until tainted</p>) : null}
			</td>
		);
	}

}

class GameField extends React.Component {

  constructor(props) {
    super(props);

    let tiles = new Tiles({});

    for(let y = 0; y < this.props.height; y++)
      for(let x = 0; x < this.props.width; x++)
        tiles.add(new Pos(x - Math.floor(y/2), y));

    let gen = new Generator(Math.random());
   	gen.generate(tiles);

    this.state = { tiles };

  }

  render() {
  	let size = 20;
    return (
        <td className='gamefield'>
          {Object.keys(this.state.tiles.tiles).map((pos, i) => {
            return <Hex key={pos} bar={this.props.bar} tile={this.state.tiles.get(pos)} pos={Pos.from(pos)} field={this} size={size} />
          })}
          <Focus pos={this.props.focus} size={size} />
      </td>
    );
  }
}

class Detail extends React.PureComponent {
	render() {

		if(!this.props.value) return null;

		return (
			<div className='hex detail' style={{
				width: this.props.size * 60 + '%',
				height: this.props.size * 60 + '%',
				backgroundColor: this.props.value.getColor()
			}}>
			</div>
		);
	}
}

class Focus extends React.Component {

	render() {
		if(!this.props.pos) return null;
		return (
			<div className='hex-focus' style={{
				width: this.props.size * (TICK_RADIUS * 2 + 1),
				height: this.props.size * (TICK_RADIUS * 2 + 1) / 1.15,
				top: (this.props.pos.y + 0.5) * (this.props.size / 1.34) ,
				left: ((this.props.pos.x + 0.5) + (this.props.pos.y / 2)) * (this.props.size / 1.17),
			}}></div>
		);
	}

}

class Hex extends React.Component {

	shouldComponentUpdate(nextProps) {
		if(this.props.isFocus)
			return true;

		let changed = nextProps.tile.changed === true;
		return changed;
	}

	constructor(props) {
	    super(props);

	    this.tick = this.tick.bind(this);
	    this.mouseOver = this.mouseOver.bind(this);
	    this.mouseOut = this.mouseOut.bind(this);

	    this.state = {};
	}

	tick() {
		let tiles = this.props.field.state.tiles.clone();
		tiles.nextTick();

		let neighboors = tiles.neighboors(this.props.pos, TICK_RADIUS);
	    for(let pos of neighboors)
	    	Type.tick(tiles, pos);

	    tiles.apply();
		this.props.field.setState({ tiles });
	}

	mouseOver(e) {

		if(this.props.pos)
			this.props.bar.focus(this.props.tile, this.props.pos);

		return;
		let tiles = this.props.field.state.tiles.clone();

	    for(let pos of tiles.neighboors(this.props.pos, TICK_RADIUS))
	    	tiles.set(pos, {hover: true});

	    tiles.apply();
		this.props.field.setState({ tiles });
	}

	mouseOut(e) {
		return;
		let tiles = this.props.field.state.tiles.clone();

	    for(let pos of tiles.neighboors(this.props.pos, TICK_RADIUS))
	    	tiles.set(pos, {hover: undefined});

	    tiles.apply();
		this.props.field.setState({ tiles });
	}

	render() {
		let tile = this.props.tile;
		if(!tile) return null;

		let display = DisplayTypes.DEFAULT;
		let color = display.color(tile, this.props.pos);

		return (
			<div className='hex'
				onClick={this.tick}
				className={'hex' + (this.props.isFocus ? ' focus' : '') + (tile.hover ? ' hover' : '')}
				onMouseOver={this.mouseOver}
				onMouseOut={this.mouseOut}
				style={ !this.props.isFocus ? {
					top: this.props.pos.y * (this.props.size / 1.37 + TILE_MARGIN),
					left: (this.props.pos.x + (this.props.pos.y / 2)) * (this.props.size / 1.19 + TILE_MARGIN),
					width: this.props.size / 1.15,
					height: this.props.size,
					backgroundColor: color
				} : {
					backgroundColor: color
				}}
			>
			{tile.detail ? <Detail size={tile.detail.size(tile)} value={display.details ? tile.detail: null} /> : null}
			</div>
		);
	}

}

export default App;

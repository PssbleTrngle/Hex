import React from 'react';
import './App.css';
import Type from './Type.js';
import Pos from './Pos.js';
import Generator from './Generator';
import Tile from './Tile';
import Season from './Season';
import DISPLAY_TYPES from './DisplayType';
import Twemoji from 'react-twemoji';

var TICK_RADIUS;
var TILE_MARGIN = 0;

function App() {

	let search = window.location.search;
	let params = new URLSearchParams(search);

	let seed = parseInt(params.get('seed'));
	let scale = parseInt(params.get('scale'));
	TICK_RADIUS = parseInt(params.get('radius'));
	let randomize = params.get('gen') == 'random';

	if(isNaN(TICK_RADIUS)) TICK_RADIUS = Infinity;
	if(isNaN(seed)) seed = Math.random();
	if(isNaN(scale)) scale = 2;

	scale = Math.max(0.3, Math.min(10, scale));

	return (<Game seed={seed} randomize={randomize} hexsize={80 / scale} width={Math.floor(scale * 17)} height={Math.floor(scale * 12)} />);
}

class Game extends React.PureComponent {

	tick() {
		this.setState({day: this.state.day + 1});
	}

	constructor(props) {
		super(props);

	    let tiles = new Tiles(this);

	    for(let y = 0; y < this.props.height; y++)
	      for(let x = 0; x < this.props.width; x++)
	        tiles.add(new Pos(x - Math.floor(y/2), y));

	    let gen = new Generator(this.props.seed, this.props.randomize);
	   	gen.generate(tiles);

		this.state = {focus: {}, display: DISPLAY_TYPES[0], day: 0, tiles};

	}

	componentDidMount() {
		this.state.tiles.tick(new Pos(0,0), Infinity);
	}

	focus(tile, pos) {
		this.setState({focus: {tile, pos}});
	}

	render() {
		return (
		  	<table className='container'><tbody><tr>
			    <GameField
				    hexsize={this.props.hexsize}
				    tiles={this.state.tiles}
				    display={this.state.display}
				    bar={this}
				    focus={this.state.focus.pos} />
			  	<Sidebar
				  	day={this.state.day}
				  	display={this.state.display}
				  	tile={this.state.focus.tile}
				  	container={this}/>
		  	</tr></tbody></table>
		);
	}

	componentDidUpdate() {
		this.state.tiles.resetChanges();
	}

}

class Tiles {

	tiles = {};
	changed = {};
	container;

	constructor(container, tiles) {
		this.container = container;
		if(tiles) this.tiles = tiles;
	}

	get(pos) {
		return this.tiles[pos];
	}

	set(pos, tile) {
		if(tile.changed) {
			if(!this.changed[pos]) this.changed[pos] = {};
			Object.assign(this.changed[pos], tile);
		}
	}

	apply() {
		for(let pos in this.changed) {
			this.tiles[pos] = Object.assign(this.tiles[pos].clone(), this.changed[pos]);
		}

		if(this.container)
			this.container.setState({tiles: this.clone()});
	}

	tick(pos, radius) {
		this.resetChanges();
		if(this.container)
			this.container.tick();

		let neighboors = this.neighboors(pos, radius);
		neighboors.push(pos);
	    for(let pos of neighboors)
	    	this.get(pos).tick(this, pos);

	    this.apply();
	}

	resetChanges() {
		for(let pos in this.tiles) {
			this.tiles[pos].changed = false;
			this.tiles[pos].update = false;
			this.changed = {};
		}
	}

	clone() {
		let tiles = Object.assign({}, this.tiles);
		return new Tiles(this.container, tiles);
	}

	add(pos){
		this.tiles[pos] = new Tile();
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
					if(Math.abs(x + y) <= radius && (x != 0 || y != 0)) {
						let pos2 = new Pos(pos.x + x, pos.y + y);
						if(this.get(pos2))
							neighboors.push(pos2);
					}

		return neighboors;

	}

}

class Button extends React.PureComponent {

	render() {
		return (
			<button onClick={this.props.click} className={'button' + (this.props.active ? ' active' : '')}>
				<Twemoji>{this.props.text}</Twemoji>
			</button>
 		);
         		
	}

}

class DisplayButtons extends React.PureComponent {

	render() {
		return (
			<table className='button-bar'><tbody>
				<tr>
         			{DISPLAY_TYPES.map((type, i) => {
         				return (<td>
         					<Button active={type === this.props.active} key={type.icon} click={() => this.props.container.setState({display: type})} container={this.props.container} text={type.icon} />
         				</td>);
         			})}
				</tr>
			</tbody></table>
		);
	}

}

class Sidebar extends React.Component {

	render() {
		return (
			<td className='sidebar'>

				<DisplayButtons active={this.props.display} container={this.props.container}/>

				{ this.props.tile ? (
					<React.Fragment>

					<h3>Day {this.props.tile.day}</h3>

					<h3>{this.props.tile.season().name}</h3>
					<h3><Twemoji>{this.props.tile.season().icon}</Twemoji></h3>

						<Hex pos={new Pos(0,0)} display={this.props.display} tile={this.props.tile} isFocus={true}/>
						<h2>{this.props.tile.type.name}</h2>
						{this.props.tile.snowed ? (<p>Snowed</p>) : null}
						{this.props.tile.taintProcess ? (<p>{this.props.tile.taintProcess - 1} turn until tainted</p>) : null}
					</React.Fragment>
				) : null}

			</td>
		);
	}

}

class GameField extends React.Component {

  render() {
  	let size = this.props.hexsize;
    return (
        <td className='gamefield'><div>
          {Object.keys(this.props.tiles.tiles).map((pos, i) => {
            pos = Pos.from(pos);
            return ( 
	            <Hex
	    			display={this.props.display}
	    			key={pos}
	    			bar={this.props.bar}
	    			tile={this.props.tiles.get(pos)}
	    			pos={pos}
	    			tiles={this.props.tiles}
	    			size={size} 
	    			hover={pos.inHex(this.props.focus, TICK_RADIUS)}
	    			focus={pos.isSame(this.props.focus)}
	    		/>
	    	);
          })}
          { TICK_RADIUS < Infinity && false ? <Focus pos={this.props.focus} size={size} /> : null}
      </div></td>
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
				width: this.props.size * (TICK_RADIUS * 2),
				height: this.props.size * (TICK_RADIUS * 2) / 1.15,
				top: (this.props.pos.y + 0.5) * (this.props.size / 1.37 + TILE_MARGIN),
				left: ((this.props.pos.x + 0.5) + (this.props.pos.y / 2)) * (this.props.size / 1.19 + TILE_MARGIN),
			}}></div>
		);
	}

}

class Hex extends React.Component {

	shouldComponentUpdate(nextProps) {
		if(this.props.isFocus)
			return true;

		if(nextProps.display != this.props.display)
			return true;

		if(nextProps.hover != this.props.hover)
			return true;

		if(nextProps.focus != this.props.focus)
			return true;

		return nextProps.tile.update === true;
	}

	constructor(props) {
	    super(props);

	    this.handleClick = this.handleClick.bind(this);

	    this.state = {};
	}

	handleClick() {
		if(this.props.isFocus) return;

		if(this.props.focus)
			return this.tick();

		if(this.props.pos)
			this.props.bar.focus(this.props.tile, this.props.pos);
	}

	tick() {
		if(this.props.isFocus) return;

		this.props.tiles.tick(this.props.pos, TICK_RADIUS);
	}

	render() {
		let tile = this.props.tile;
		if(!tile) return null;

		let display = this.props.display;
		let color = display.color(tile, this.props.pos);

		return (
			<div
				onClick={this.handleClick}
				className={'hex tile' + (this.props.isFocus ? ' focus' : '') + (this.props.hover ? ' hover' : '')}
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

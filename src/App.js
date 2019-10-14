import React from 'react';
import './App.css';
import Type from './classes/Type.js';
import Pos from './classes/Pos.js';
import Generator from './classes/Generator';
import Tile from './classes/Tile';
import Tribe from './classes/Tribe';
import Season from './classes/Season';
import Lunar from './classes/Lunar';
import DISPLAY_TYPES from './classes/DisplayType';
import Twemoji from 'react-twemoji';
import {noise} from './perlin.js';

var TICK_RADIUS;
var TILE_MARGIN = 0;
var TICK_TIME = 300;
var DISCOVER_MODE;

function App() {

	let search = window.location.search;
	let params = new URLSearchParams(search);

	let seed = parseInt(params.get('seed'));
	let scale = parseInt(params.get('scale'));
	TICK_RADIUS = parseInt(params.get('radius'));
	let randomize = params.get('gen') == 'random';
	DISCOVER_MODE = params.get('mode') == 'discover';

	if(isNaN(TICK_RADIUS)) TICK_RADIUS = 3;
	if(isNaN(seed)) seed = Math.random();
	if(isNaN(scale)) scale = 3;
	if(params.get('radius') == 'infinite') TICK_RADIUS = Infinity;

	scale = Math.max(0.3, Math.min(10, scale));

	return (<Game seed={seed} randomize={randomize} hexsize={80 / scale} width={Math.floor(scale * 17)} height={Math.floor(scale * 12)} />);
}

class Game extends React.PureComponent {

	tick() {
		this.setState({isNight: !this.state.isNight});
	}

	constructor(props) {
		super(props);

	    let tiles = new Tiles(this);

	    for(let y = 0; y < this.props.height; y++)
	      for(let x = 0; x < this.props.width; x++)
	        tiles.add(new Pos(x - Math.floor(y/2), y));

	    let gen = new Generator(this.props.seed, this.props.randomize);
	   	gen.generate(tiles);

		this.state = {focus: {}, isNight: true, display: DISPLAY_TYPES[0], day: 0, tiles};

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
			    	night={this.state.isNight}
				    tiles={this.state.tiles}
				    hexsize={this.props.hexsize}
				    display={this.state.display}
				    bar={this}
				    focus={this.state.focus.pos} />
			  	<Sidebar
				    tiles={this.state.tiles}
				  	day={this.state.day}
				  	display={this.state.display}
				    focus={this.state.focus} 
				  	container={this} />
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

		let next = this.clone();

		let neighboors = next.neighboors(pos, radius, true);
		let largerNeighboors = next.neighboors(pos, radius + 1, true);

		//increment day
	    for(let pos of neighboors) {
	    	let n = next.get(pos);
	    	n.set({day: n.day + 1});
	    }

	    //update diff
	    for(let pos of largerNeighboors)
	    	next.get(pos).updateDiff(next, pos);

	    //tick
	    for(let pos of neighboors)
	    	next.get(pos).tick(next, pos);

	    next.apply();
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

	neighboors(pos, radius, addCenter) {
		if(!radius) radius = 1;

		let neighboors = [];

		if(radius == Infinity)
			for(let pos in this.tiles)
				neighboors.push(Pos.from(pos))

		else 
			for(let x = -radius; x <= radius; x++)
				for(let y = -radius; y <= radius; y++)
					if(Math.abs(x + y) <= radius && (addCenter || x != 0 || y != 0)) {
						let pos2 = new Pos(pos.x + x, pos.y + y);
						if(this.get(pos2))
							neighboors.push(pos2);
					}

		return neighboors;

	}

	isNight() {
		return this.container && this.container.state.isNight;
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
			<div className='button-bar'>
         			{DISPLAY_TYPES.map((type, i) => {
         				return (
         					<Button active={type === this.props.active} key={type.icon} click={() => this.props.container.setState({display: type})} text={type.icon} />
         				);
         			})}
			</div>
		);
	}

}

class PlayButtons extends React.Component {

	constructor(props) {
		super(props);

		this.state = {active: false};
	}

	toggle() {
		let active = !this.state.active && this.props.focus.pos;

		let tick = 
			function(button) {

				if(button.props.focus.pos)
					button.props.tiles.tick(button.props.focus.pos, TICK_RADIUS);
				else button.toggle();

			};

		if(active) {
			tick(this);
			this.state.interval = window.setInterval(tick, TICK_TIME, this);
		}

		else
			window.clearInterval(this.state.interval);

		this.setState({active});
	}

	render() {
		return (
			<div className='button-bar'>
				<Button active={this.state.active} click={() => this.toggle()} text={this.state.active ? '⏸' : '▶'} />
			</div>
		);
	}

}

class Sidebar extends React.Component {

	render() {
		return (
			<td className='sidebar'>

				<PlayButtons tiles={this.props.tiles} focus={this.props.focus} />
				<DisplayButtons active={this.props.display} container={this.props.container}/>

				{ this.props.focus.tile ? (
					<React.Fragment>

					<h3>Day {this.props.focus.tile.day}</h3>

					<h3>{this.props.focus.tile.season().name}</h3>
					<h3><Twemoji>
							{this.props.focus.tile.season().icon}
							{this.props.focus.tile.lunar().icon}
						</Twemoji>
					</h3>

					<Hex pos={new Pos(0,0)} display={this.props.display} tile={this.props.focus.tile} isFocus={true}/>
					<h2>{this.props.focus.tile.type.name}</h2>
					{this.props.focus.tile.snowed ? (<p>Snowed</p>) : null}
					{this.props.focus.tile.taintProcess ? (<p>{this.props.focus.tile.taintProcess - 1} turn until tainted</p>) : null}
					{this.props.focus.tile.detail ? (<p>{this.props.focus.tile.detail.name}</p>) : null}

					{Object.keys(this.props.focus.tile.tribes).map(tribe => {
						let amount = this.props.focus.tile.tribes[tribe];
						return <p>{amount} {tribe}{amount != 1 ? 's' : ''}</p>
					})}

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
        <td className='gamefield-container'>
	        <div className={'gamefield ' + (this.props.night ? 'night' : 'day')}>
	        	<div>
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
	        	</div>
				<div className='clouds'>
					{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
						return <Cloud key={i} size={size * (1 + Math.random() * 2)} top={Math.random() * 100} delay={Math.random() * 20}/>
					})}
				</div>
	          { TICK_RADIUS < Infinity && false ? <Focus pos={this.props.focus} size={size} /> : null}
	      </div>
      </td>
    );
  }
}

class Cloud extends React.Component {

	shouldComponentUpdate(nextProps) {
		return false;
	}

	render() {
		return (
			<div
				className='hex cloud'
				style={{
					width: this.props.size / 1.15,
					height: this.props.size,
					top: this.props.top + '%',
					animationDelay: this.props.delay + 's'
				}}
			></div>
		);
	}

}

class Detail extends React.PureComponent {
	render() {

		if(!this.props.value) return null;
		let svg = this.props.value.icon();

		return (
			<div className='hex detail' style={{
				width: this.props.size * 60 + '%',
				height: this.props.size * 60 + '%',
				backgroundColor: svg ? 'transparent' : this.props.value.getColor()
				}}
			>
			{svg ? <img draggable={false} src={require('./assets/' + svg.toLowerCase() + '.svg')}></img> : null}
			</div>
		);
	}
}

class TribeSpot extends React.PureComponent {
	render() {
		let i = this.props.index;
		let r = 30;
		return (
			<div className='tribe' style={{
				top: (50 - Math.sin(Math.PI * 6 / Tribe.MAX * i) * r) + '%',
				left: (50 - Math.cos(Math.PI * 6 / Tribe.MAX * i) * r * 1.15) + '%',
				backgroundColor: this.props.tribe.color
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

		let undiscoverd = DISCOVER_MODE && tile.day < 2;
		let details = !undiscoverd && this.props.display.details;
		let color = undiscoverd ? null : this.props.display.color(tile, this.props.pos);
		let text = this.props.display.text(tile, this.props.pos);
		let index = Math.floor(noise.simplex2(this.props.pos.x, this.props.pos.y) * (Tribe.MAX - 1));

		return (
			<div
				onClick={this.handleClick}
				className={'hex tile' + (this.props.isFocus ? ' focus' : '') + (this.props.hover ? ' hover' : '') + (tile.type.glowing ? ' glowing' : '')}
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

			{Object.keys(tile.tribes).map((tribe) => {
				if(!details) return null;
				let tribes = [];
				for(let i = 0; i < tile.tribes[tribe]; i++)
					tribes.push(<TribeSpot index={index++} key={tribe + '_' + i} tribe={Tribe.fromString(tribe)} size={this.props.size * 0.15}/>)
				return tribes;				
			})}

			{tile.detail && details ? <Detail size={tile.detail.size(tile)} value={tile.detail} /> : null}

			{!details && text != null ? <p>{text}</p> : null}
			</div>
		);
	}

}

export default App;

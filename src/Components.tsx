import React from 'react';

import { Pos } from './classes/Pos';
import { Tile } from './classes/Tile';
import { Tiles } from './classes/Tiles';
import { Tribe } from './classes/Tribe';
import { Generator } from './classes/Generator';
import { Detail } from './classes/Detail';
import {DisplayType, DISPLAY_TYPES} from './classes/DisplayType';

import Twemoji from 'react-twemoji';

type GameFocus = {
	pos: Pos|undefined, tile: Tile|undefined
};

type GameOptions = {
	width: number,
	height: number,
	hexsize: number,
	radius: number,
	margin: number,
	interval: number,
	discover: boolean,
	seed: number,
}

type GameState = {
	focus: GameFocus,
	isNight: boolean,
	display: DisplayType,
	day: number,
	tiles: Tiles,
};

export class Game extends React.PureComponent<GameOptions, GameState> {

	tick() {
		this.setState({isNight: !this.state.isNight});
	}

	constructor(props: any, public generator: Generator) {
		super(props);

		this.generator = new Generator(this.props.seed, false);

	    let tiles = new Tiles(this, this.props.radius);

	    for(let y = 0; y < this.props.height; y++)
	      for(let x = 0; x < this.props.width; x++)
	        tiles.add(new Pos(x - Math.floor(y/2), y));

		this.state = {focus: {pos: undefined, tile: undefined}, isNight: false, display: DISPLAY_TYPES[0], tiles, day: 0};

	}

	componentDidMount() {
		return;
		this.state.tiles.tick(new Pos(0,0), Infinity);
	}

	focus(focus: GameFocus) {
		this.setState({focus});
	}

	render() {
		return (
		  	<table className='container'><tbody><tr>
			    <GameField
			    	options={this.props}
			    	night={this.state.isNight}
				    tiles={this.state.tiles}
				    display={this.state.display}
				    bar={this}
				    focus={this.state.focus} />
			  	<Sidebar
			    	options={this.props}
				    tiles={this.state.tiles}
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

export class Button extends React.PureComponent<{click: ((event: React.MouseEvent) => void), active: boolean, text: string},{}> {

	render() {
		return (
			<button onClick={this.props.click} className={'button' + (this.props.active ? ' active' : '')}>
				<Twemoji>{this.props.text}</Twemoji>
			</button>
 		);
         		
	}

}

export class DisplayButtons extends React.PureComponent<{active: DisplayType, container: React.Component},{}> {

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

export class PlayButtons extends React.Component<{focus: GameFocus, tiles: Tiles, options: GameOptions},{active: boolean, interval: any}> {

	constructor(props: any) {
		super(props);

		this.state = {active: false, interval: undefined};
	}

	toggle() {
		let active = !this.state.active && this.props.focus.pos !== undefined;

		let tick = 
			function(button: PlayButtons) {

				if(button.props.focus.pos)
					button.props.tiles.tick(button.props.focus.pos);
				else button.toggle();

			};

		if(active) {
			tick(this);
			this.setState({interval: setInterval(tick, this.props.options.interval, this)});
		}

		else
			clearInterval(this.state.interval);

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

export class Sidebar extends React.Component<{tiles: Tiles, display: DisplayType, focus: GameFocus, container: React.Component, options: GameOptions},{}> {

	render() {

		return (
			<td className='sidebar'>

				<PlayButtons tiles={this.props.tiles} focus={this.props.focus} options={this.props.options}/>
				<DisplayButtons active={this.props.display} container={this.props.container}/>

				{ this.props.focus.tile && this.props.focus.pos ? (
					<>

					<h3>Day {this.props.focus.tile.day}</h3>

					<h3>{this.props.focus.tile.season.name}</h3>
					<h3><Twemoji>
							{this.props.focus.tile.season.icon}
							{this.props.focus.tile.lunar.icon}
						</Twemoji>
					</h3>

					<Hex options={this.props.options} pos={this.props.focus.pos} display={this.props.display} tile={this.props.focus.tile} isFocus={true}/>
					<h2>{this.props.focus.tile.type.name}</h2>
					{this.props.focus.tile.snowed ? (<p>Snowed</p>) : null}
					{this.props.focus.tile.taintProcess ? (<p>{this.props.focus.tile.taintProcess - 1} turn until tainted</p>) : null}
					{this.props.focus.tile.detail ? (<p>{this.props.focus.tile.detail.name}</p>) : null}

					<Twemoji>
						<p>🌡 {this.props.focus.tile.temp.toFixed(2)}</p>
						<p>⚡ {this.props.focus.tile.energy.toFixed(2)}</p>
					</Twemoji>

					{Array.from(this.props.focus.tile.tribes).map(([tribe, amount]) => {
						return <p key={tribe.name}>{amount} {tribe.name}{amount  !==  1 ? 's' : ''}</p>
					})}

					</>
				) : null}

			</td>
		);
	}

}

export class GameField extends React.Component<{options: GameOptions, night: boolean, tiles: Tiles, focus: GameFocus, bar: Game, display: DisplayType},{}> {

  render() {
  	let size = this.props.options.hexsize;
    return (
        <td className='gamefield-container'>
	        <div className={'gamefield ' + (this.props.night ? 'night' : 'day')}>
	        	<div>
		          {this.props.tiles.map((tile, pos) => {
		            return (
			            <Hex
			            	options={this.props.options}
			    			display={this.props.display}
			    			key={pos.toString()}
			    			bar={this.props.bar}
			    			tile={tile}
			    			pos={pos}
			    			tiles={this.props.tiles}
			    			hover={pos.inHex(this.props.focus.pos, this.props.options.radius)}
			    			focus={pos.isSame(this.props.focus.pos)}
			    		/>
			    	);
		          })}
	        	</div>
				<div className='clouds'>
					{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
						return <Cloud key={i} size={size * (1 + Math.random() * 2)} top={Math.random() * 100} delay={Math.random() * 20}/>
					})}
				</div>
	          { /* DISABLED */ this.props.options.radius < Infinity && false ? <Focus options={this.props.options} pos={this.props.focus.pos} size={size} /> : null}
	      </div>
      </td>
    );
  }
}

export class Cloud extends React.Component<{size: number, top: number, delay: number},{}> {

	shouldComponentUpdate(nextProps: Object) {
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

export class DetailComponent extends React.PureComponent<{value: Detail, size: number},{}> {
	render() {

		if(!this.props.value) return null;
		let svg = this.props.value.icon();

		return (
			<div className='hex detail' style={{
				width: this.props.size * 60 + '%',
				height: this.props.size * 60 + '%',
				backgroundColor: svg ? 'transparent' : this.props.value.color
				}}
			>
			{svg ? <img alt={this.props.value.name} draggable={false} src={require('./assets/' + svg.toString().toLowerCase() + '.svg')}></img> : null}
			</div>
		);
	}
}

export class TribeSpot extends React.PureComponent<{index: number, tribe: Tribe},{}> {
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

export class Focus extends React.Component<{options: GameOptions, size: number, pos: Pos | undefined},{}> {

	render() {
		if(!this.props.pos) return null;
		return (
			<div className='hex-focus' style={{
				width: this.props.size * (this.props.options.radius * 2),
				height: this.props.size * (this.props.options.radius * 2) / 1.15,
				top: (this.props.pos.y + 0.5) * (this.props.size / 1.37 + this.props.options.margin),
				left: ((this.props.pos.x + 0.5) + (this.props.pos.y / 2)) * (this.props.size / 1.19 + this.props.options.margin),
			}}></div>
		);
	}

}

interface TileProps {
	display: DisplayType;
	bar?: Game;
	tile: Tile;
	pos: Pos;
	tiles?: Tiles;
	hover?: boolean;
	focus?: boolean;
	isFocus?: boolean;
	options: GameOptions;
}

export class Hex extends React.Component<TileProps,{}> {

	shouldComponentUpdate(nextProps: TileProps) {

		if(this.props.isFocus)
			return true;

		if(nextProps.display  !==  this.props.display)
			return true;

		if(nextProps.hover  !==  this.props.hover)
			return true;

		if(nextProps.focus  !==  this.props.focus)
			return true;

		return nextProps.tile.changed === true;
	}

	constructor(props: TileProps) {
	    super(props);

	    this.handleClick = this.handleClick.bind(this);

	    this.state = {};
	}

	handleClick() {
		if(this.props.isFocus) return;

		if(this.props.focus)
			return this.tick();

		if(this.props.bar)
			this.props.bar.focus(this.props);
	}

	tick() {
		if(!this.props.tiles) return;

		this.props.tiles.tick(this.props.pos, this.props.options.radius);
	}

	render() {
		let tile = this.props.tile;

		let undiscoverd = this.props.options.discover && tile.day < 2;
		let details = !undiscoverd && this.props.display.details;
		let color = undiscoverd ? undefined : this.props.display.color(tile, this.props.pos);
		let text = this.props.display.text(tile, this.props.pos);
		/* let index = Math.floor(noise.simplex2(this.props.pos.x, this.props.pos.y) * (Tribe.MAX - 1)); */
		let index = 0;
		let size = this.props.options.hexsize;
		
		return (
			<div
				onClick={this.handleClick}
				className={'hex tile' + (this.props.isFocus ? ' focus' : '') + (this.props.hover ? ' hover' : '') + (tile.type.glowing ? ' glowing' : '')}
				style={ !this.props.isFocus && size ? {
					top: this.props.pos.y * (size / 1.37 + this.props.options.margin),
					left: (this.props.pos.x + (this.props.pos.y / 2)) * (size / 1.19 + this.props.options.margin),
					width: size / 1.15,
					height: size,
					backgroundColor: color,
				} : {
					backgroundColor: color,
				}}
			>

			{Array.from(tile.tribes).map(([tribe, amount]) => {
				if(!details) return null;
				let tribes = [];
				for(let i = 0; i < amount; i++)
					tribes.push(<TribeSpot index={index++} key={tribe + '_' + i} tribe={tribe} />)
				return tribes;				
			})}

			{tile.detail && details ? <DetailComponent size={tile.detail.size(tile)} value={tile.detail} /> : null}

			{!details && text  !==  null ? <p>{text}</p> : null}
			</div>
		);
	}

}
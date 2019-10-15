import React from 'react';

import { Game } from './Components';
import './App.css';

function App() {

	let search = window.location.search;
	let params = new URLSearchParams(search);

	let seed = parseInt(params.get('seed') || '');
	let scale = parseInt(params.get('scale') || '');
	let radius = parseInt(params.get('radius') || '');
	let randomize = params.get('gen') === 'random';
	let discover = params.get('mode') === 'discover';

	if(isNaN(radius)) radius = 3;
	if(isNaN(seed)) seed = Math.random();
	if(isNaN(scale)) scale = 3;
	if(params.get('radius') === 'infinite') radius = Infinity;

	scale = Math.max(0.3, Math.min(10, scale));

	return (
		<Game
			width={Math.floor(scale * 17)}
			height={Math.floor(scale * 12)}
			hexsize={80 / scale}
			radius={radius}
			margin={0}
			interval={500}
			discover={discover}
			seed={seed}
		/>
	);
}

export default App;

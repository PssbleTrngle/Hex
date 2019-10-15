class Lunar {

	static DAYS_PER_PHASE = 3;
	static START = 1;

	static get(days: number): Lunar {

		return Lunar.VALUES[(Math.floor(days / Lunar.DAYS_PER_PHASE) + Lunar.START) % Lunar.VALUES.length]

	}

	static VALUES: Lunar[] = [
		new Lunar('🌑', 'New Moon'),
    	new Lunar('🌒', 'Waxing Crescent'),
    	new Lunar('🌓', 'First Quarter'),
    	new Lunar('🌔', 'Waxing Gibbous', true),
    	new Lunar('🌕', 'Full Moon'),
    	new Lunar('🌖', 'Waning Gibbous'),
    	new Lunar('🌗', 'Last Quarter'),
    	new Lunar('🌘', 'Waning Crescent', true)
    ];

	constructor(public icon: string, public name: string, public growRift: boolean = false) {}

}

export default Lunar;
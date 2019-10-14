class Lunar {

	static DAYS_PER_PHASE = 3;
	static START = 1;

	static get(days) {

		return Lunar.VALUES[(Math.floor(days / Lunar.DAYS_PER_PHASE) + Lunar.START) % Lunar.VALUES.length]

	}

	static VALUES = [
		new Lunar('🌑', 'New Moon'),
    	new Lunar('🌒', 'Waxing Crescent'),
    	new Lunar('🌓', 'First Quarter'),
    	new Lunar('🌔', 'Waxing Gibbous', true),
    	new Lunar('🌕', 'Full Moon'),
    	new Lunar('🌖', 'Waning Gibbous'),
    	new Lunar('🌗', 'Last Quarter'),
    	new Lunar('🌘', 'Waning Crescent', true)
    ];

	name;

	constructor(icon, name, growRift) {
		this.name = name;
		this.icon = icon;
		this.growRift = !!growRift;
	}

}

export default Lunar;
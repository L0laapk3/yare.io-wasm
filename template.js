
memory.spirits = Object.values(spirits);
memory.base = base;
memory.enemy_base = enemy_base;
memory.stars = [ star_zxq, star_a1c ];

if (memory.wasm_cache != 1) {
	buff = Buffer.from("${contents}", "base64");
	
	arr = new Uint8Array(buff.length);
	for (let i = 0; i < buff.length; ++i)
		arr[i] = buff[i];

	importObject = {
        imports: {
            energize: (fromIndex, toIndex) => memory.spirits[fromIndex].energize(spirits[toIndex]),
            move: (index, x, y) => memory.spirits[index].move([x, y]),
            merge: (fromIndex, toIndex) => memory.spirits[fromIndex].merge(spirits[toIndex]),
            divide: (index) => memory.spirits[index].divide(),
            jump: (index, x, y) => memory.spirits[index].jump([x, y]),
			shout: (index, string) => {},
			label: (index, string) => {},

			spiritCount: () => memory.spirits.length,
			spiritIsFriendly: (index) => memory.spirits[index].player_id == memory.player_id,
			spiritPositionX: (index) => memory.spirits[index].position[0],
			spiritPositionY: (index) => memory.spirits[index].position[1],
			spiritSize: (index) => memory.spirits[index].size,
			spiritEnergyCapacity: (index) => memory.spirits[index].energy_capacity,
			spiritEnergy: (index) => memory.spirits[index].energy,
			spiritHp: (index) => memory.spirits[index].hp,

			basePositionX: () => memory.base.position[0],
			basePositionY: () => memory.base.position[1],
			baseSize: () => memory.base.size,
			baseEnergyCapacity: () => memory.base.energy_capacity,
			baseEnergy: () => memory.base.energy,
			baseHp: () => memory.base.hp,
			enemyBasePositionX: () => memory.enemy_base.position[0],
			enemyBasePositionY: () => memory.enemy_base.position[1],
			enemyBaseSize: () => memory.enemy_base.size,
			enemyBaseEnergyCapacity: () => memory.enemy_base.energy_capacity,
			enemyBaseEnergy: () => memory.enemy_base.energy,
			enemyBaseHp: () => memory.enemy_base.hp,

			starCount: () => memory.stars.length,
			starPositionX: (index) => memory.stars[index].position[0],
			starPositionY: (index) => memory.stars[index].position[1],
        }
	};

	wasm = new WebAssembly.Module(arr);
	inst = new WebAssembly.Instance(wasm, importObject);
	memory.wasm_tick = inst.exports.tick;
	memory.wasm_cache = 1;
	console.log("compiled new wasm script");
}

memory.wasm_tick();


const fs = require('fs');
const minify = require('minify');

(async function() {
	const contents = fs.readFileSync(process.argv[2], {encoding: 'base64'});
	const unique = new Date().getTime();
	const botCode = bot.toString().replace(/function bot\(\) \{([\s\S]+)\}/, '$1').replace(/__UNIQUE__/g, unique).replace(/__CONTENTS__/g, contents);

	const botCodeMinified = await minify.js(botCode);
	fs.writeFileSync("bot.js", botCodeMinified);
})();



function bot() {
	memory.spirits = Object.values(spirits);
	memory.base = base;
	memory.enemy_base = enemy_base;
	memory.stars = stars;
	memory.player_id = my_spirits[0].player_id;

	if (memory.wasm_cache != "__UNIQUE__") {
		buff = Buffer.from("__CONTENTS__", "base64");
		
		arr = new Uint8Array(buff.length);
		for (let i = 0; i < buff.length; ++i)
			arr[i] = buff[i];

		importObject = {
			spirits: {
				count: () => memory.spirits.length,
				isFriendly: (index) => memory.spirits[index].player_id == memory.player_id,
				positionX: (index) => memory.spirits[index].position[0],
				positionY: (index) => memory.spirits[index].position[1],
				size: (index) => memory.spirits[index].size,
				energyCapacity: (index) => memory.spirits[index].energy_capacity,
				energy: (index) => memory.spirits[index].energy,
				hp: (index) => memory.spirits[index].hp,

				energize: (fromIndex, toIndex) => memory.spirits[fromIndex].energize(spirits[toIndex]),
				energizeBase: (index) => memory.spirits[index].energize(memory.base),
				energizeEnemyBase: (index) => memory.spirits[index].energize(memory.enemy_base),
				move: (index, x, y) => memory.spirits[index].move([x, y]),
				merge: (fromIndex, toIndex) => memory.spirits[fromIndex].merge(spirits[toIndex]),
				divide: (index) => memory.spirits[index].divide(),
				jump: (index, x, y) => memory.spirits[index].jump([x, y]),
				shout: (index, string) => {},
				label: (index, string) => {},
			},
			base: {
				positionX: () => memory.base.position[0],
				positionY: () => memory.base.position[1],
				size: () => memory.base.size,
				energyCapacity: () => memory.base.energy_capacity,
				energy: () => memory.base.energy,
				hp: () => memory.base.hp,
			},
			enemyBase: {
				positionX: () => memory.enemy_base.position[0],
				positionY: () => memory.enemy_base.position[1],
				size: () => memory.enemy_base.size,
				energyCapacity: () => memory.enemy_base.energy_capacity,
				energy: () => memory.enemy_base.energy,
				hp: () => memory.enemy_base.hp,
			},
			stars: {
				count: () => memory.stars.length,
				positionX: (index) => memory.stars[index].position[0],
				positionY: (index) => memory.stars[index].position[1],
			},
			console: {
				log: (string) => {},
			}
		};

		wasm = new WebAssembly.Module(arr);
		inst = new WebAssembly.Instance(wasm, importObject);
		memory.wasm_tick = inst.exports.tick;
		memory.wasm_cache = "__UNIQUE__";
		console.log("compiled new wasm script");
	}

	memory.wasm_tick();
}
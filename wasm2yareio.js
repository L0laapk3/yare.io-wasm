
const http = require("http");

const { memory } = require('console');
const fs = require('fs').promises;
const minify = require('minify');


const inputPath = process.argv[2];
const gen = new Promise(async resolve => {
	const contents = await fs.readFile(inputPath, {encoding: 'base64'});
	const unique = new Date().getTime();
	let botCode = bot.toString().replace(/function bot\(\) \{([\s\S]+)\}/, '$1').replace(/__UNIQUE__/g, unique).replace(/__CONTENTS__/g, contents);
	botCode = await minify.js(botCode);
	botCode = `startTime=new Date().getTime()\n${botCode}\nconsole.log(\`\${new Date().getTime()-startTime}ms\`)`;
	resolve(botCode)
});



let closed = false;
const server = http.createServer(async (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Connection", "close");
	const botCode = await gen;
	res.write(botCode);
	res.end();
}).listen(8194);

const delay = new Promise(resolve => setTimeout(resolve, 1000));
(async function() {
	const botCode = await gen;
	await fs.writeFile(inputPath.replace(/.wasm$/i, ".js"), botCode);
	await delay;
	closed = true;
	server.close();
})();



function bot() {
	memory.spirits = Object.values(spirits);
	memory.bases = [ base, enemy_base ];
	memory.stars = [ star_zxq, star_a1c ];
	memory.player_id = this_player_id;
	memory.tick = (memory.tick + 1) || 0;

	if (memory.wasm_cache != "__UNIQUE__") {
		const startCompile = new Date().getTime();
		buff = Buffer.from("__CONTENTS__", "base64");
		
		arr = new Uint8Array(buff.length);
		for (let i = 0; i < buff.length; ++i)
			arr[i] = buff[i];

		const ptrToString = ptr => {
			const buffer = new Uint8Array(memory.wasm_memory.buffer, ptr);
			let str = "", offset = 0;
			while(true) {
				const ch = buffer[offset++];
				if (!ch)
					return decodeURIComponent(escape(str));
				str += String.fromCharCode(ch);
			}
		};

		importObject = {
			spirits: {
				count: () => memory.spirits.length,
				isFriendly: (index) => memory.spirits[index].player_id == memory.player_id,
				positionX: (index) => memory.spirits[index].position[0],
				positionY: (index) => memory.spirits[index].position[1],
				position: (index) => [ memory.sprites[index].position[0], memory.spirits[index].position[1] ],
				size: (index) => memory.spirits[index].size,
				shape: (index) => memory.spirits[index].shape == "squares" ? 1 : 0,
				energyCapacity: (index) => memory.spirits[index].energy_capacity,
				energy: (index) => memory.spirits[index].energy,
				id: (index) => parseInt(memory.spirits[index].id.match(/_(\d)+$/)[1]) - 1,
				hp: (index) => memory.spirits[index].hp,

				energize: (fromIndex, toIndex) => memory.spirits[fromIndex].energize(memory.spirits[toIndex]),
				energizeBase: (index, baseIndex) => memory.spirits[index].energize(memory.bases[baseIndex]),
				move: (index, x, y) => memory.spirits[index].move([x, y]),
				merge: (fromIndex, toIndex) => memory.spirits[fromIndex].merge(memory.spirits[toIndex]),
				divide: (index) => memory.spirits[index].divide(),
				jump: (index, x, y) => memory.spirits[index].jump([x, y]),
				shout: (index, strPtr) => {memory.spirits[index].shout(ptrToString(strPtr))},
				// set_mark: (index, strPtr) => {memory.spirits[index].set_mark(ptrToString(strPtr))}, // this function is useless lol
			},
			bases: {
				count: () => memory.bases.length,
				positionX: (index) => memory.bases[index].position[0],
				positionY: (index) => memory.bases[index].position[1],
				position: (index) => [ memory.bases[index].position[0], memory.bases[index].position[1] ],
				size: (index) => memory.bases[index].size,
				energyCapacity: (index) => memory.bases[index].energy_capacity,
				energy: (index) => memory.bases[index].energy,
				currentSpiritCost: (index) => memory.bases[index].current_spirit_cost,
				hp: (index) => memory.bases[index].hp,
			},
			stars: {
				count: () => memory.stars.length,
				positionX: (index) => memory.stars[index].position[0],
				positionY: (index) => memory.stars[index].position[1],
				position: (index) => [ memory.stars[index].position[0], memory.stars[index].position[1] ],
			},
			console: {
				log: (strPtr) => console.log(ptrToString(strPtr)),
			}
		};

		const wasm = new WebAssembly.Module(arr);
		const inst = new WebAssembly.Instance(wasm, importObject);
		memory.wasm_tick = inst.exports.tick;
		memory.wasm_memory = inst.exports.memory;
		memory.wasm_cache = "__UNIQUE__";
		console.log(`compiled new wasm script in ${new Date().getTime() - startCompile}ms`);
	}

	memory.wasm_tick(memory.tick);
}

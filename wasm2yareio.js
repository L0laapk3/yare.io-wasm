
const http = require("http");
const { exec } = require("child_process");
const fs = require('fs').promises;
const minify = require('minify');
const { memory } = require("console");


const inputPath = process.argv[2];
const autoUpdateCode = !process.argv.slice(3).includes("--no-auto-update");

const gen = new Promise(async resolve => {
	const contents = await fs.readFile(inputPath, {encoding: 'base64'});
	const unique = new Date().getTime();
	let botCode = bot.toString().replace(/function bot\(\) \{([\s\S]+)\}/, '$1').replace(/__UNIQUE__/g, unique).replace(/__CONTENTS__/g, contents);
	botCode = await minify.js(botCode);
	resolve(botCode);
});



let updates = 0;
let closed = false;
let server;
const downloadedPromise = new Promise(resolve => {
	if (autoUpdateCode)
		server = http.createServer(async (req, res) => {
			if (!updates++)
				resolve();
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			res.setHeader("Connection", "close");
			const botCode = await gen;
			res.write(botCode);
			res.end();
		}).listen(8194);
});

const delay = new Promise(resolve => setTimeout(resolve, 1000));
(async function() {
	const botCode = await gen;
	await fs.writeFile(inputPath.replace(/.wasm$/i, ".js"), botCode);
	if (!autoUpdateCode)
		return;
	await delay;
	closed = true;
	await new Promise(resolve => server.close(resolve));
	if (updates == 0) {
		server.listen(8194);
		exec(`start chrome /new-window https://yare.io/set_code`);
		await Promise.any([downloadedPromise, new Promise(resolve => setTimeout(resolve, 5000))]);
	}
	await new Promise(resolve => server.close(resolve));
})();



function bot() {
	startTime = new Date().getTime();

	memory.spirits = Object.values(spirits);
	memory.bases = Object.values(bases);
	memory.stars = Object.values(stars);
	memory.outposts = Object.values(outposts);
	memory.pylons = Object.values(pylons);
	memory.players = Object.values(players);
	memory.player_id = this_player_id;
	memory.global = globalThis;
	
	if (memory.wasm_cache != "__UNIQUE__") {
		try {
			const startCompile = new Date().getTime();

			const ptrToStr = ptr => {
				const buffer = new Uint8Array(memory.wasm_memory.buffer, ptr);
				let str = "", offset = 0;
				while(true) {
					const ch = buffer[offset++];
					if (!ch)
						return decodeURIComponent(escape(str));
					str += String.fromCharCode(ch);
				}
			};
			const strToPtr = str => {
				str = unescape(encodeURIComponent(str));
				const ptr = memory.wasm_alloc_fn(str.length + 1); // wasm is also expected to deallocate the pointer when done with the string
				const buffer = new Uint8Array(memory.wasm_memory.buffer, ptr, str.length + 1);
				for (let i = 0; i < str.length; i++)
					buffer[i] = str.charCodeAt(i);
				buffer[str.length] = 0;
				return ptr;
			};

			const spiritNumber = s => parseInt(s.id.match(/_(\d+)$/)[1]) - 1;
			const spiritPlayerId = s => memory.players.indexOf(s.player_id);
			const spiritId = s => [ spiritPlayerId(s), spiritNumber(s) ];

			const SHAPES = ["circles", "squares", "triangles"];

			importObject = {
				spirits: {
					count: () => memory.spirits.length,
					nameAlloc: (index) => strToPtr(memory.spirits[index].id), // wasm side is responsible for deallocating!
					positionX: (index) => memory.spirits[index].position[0],
					positionY: (index) => memory.spirits[index].position[1],
					position: (index) => [ memory.spirits[index].position[0], memory.spirits[index].position[1] ],
					size: (index) => memory.spirits[index].size,
					shape: (index) => SHAPES.indexOf(memory.spirits[index].shape),
					energyCapacity: (index) => memory.spirits[index].energy_capacity,
					energy: (index) => memory.spirits[index].energy,
					id: (index) => spiritId(memory.spirits[index]),
					number: (index) => spiritNumber(memory.spirits[index]),
					playerId: (index) => spiritPlayerId(memory.spirits[index]),
					hp: (index) => memory.spirits[index].hp,
					lastEnergizedId: (index) => memory.spirits[index].last_energized && spiritId(global[memory.spirits[index].last_energized]),
					lastEnergizedNumber: (index) => memory.spirits[index].last_energized && spiritNumber(global[memory.spirits[index].last_energized]),
					lastEnergizedPlayerId: (index) => memory.spirits[index].last_energized && spiritPlayerId(global[memory.spirits[index].last_energized]),

					energize: (fromIndex, toIndex) => memory.spirits[fromIndex].energize(memory.spirits[toIndex]),
					energizeBase: (index, baseIndex) => memory.spirits[index].energize(memory.bases[baseIndex]),
					energizeOutpost: (index, outpostIndex) => memory.spirits[index].energize(memory.outposts[outpostIndex]),
					energizePylon: (index, pylonIndex) => memory.spirits[index].energize(memory.pylons[pylonIndex]),
					energizeStar: (index, starIndex) => memory.spirits[index].energize(memory.stars[starIndex]),
					move: (index, x, y) => memory.spirits[index].move([x, y]),
					merge: (fromIndex, toIndex) => memory.spirits[fromIndex].merge(memory.spirits[toIndex]),
					divide: (index) => memory.spirits[index].divide(),
					jump: (index, x, y) => memory.spirits[index].jump([x, y]),
					explode: (index) => memory.spirits[index].explode(),
					shout: (index, strPtr) => {memory.spirits[index].shout(ptrToStr(strPtr))},
				},
				bases: {
					count: () => memory.bases.length,
					nameAlloc: (index) => strToPtr(memory.bases[index].id), // wasm side is responsible for deallocating!
					positionX: (index) => memory.bases[index].position[0],
					positionY: (index) => memory.bases[index].position[1],
					position: (index) => [ memory.bases[index].position[0], memory.bases[index].position[1] ],
					energyCapacity: (index) => memory.bases[index].energy_capacity,
					energy: (index) => memory.bases[index].energy,
					currentSpiritCost: (index) => memory.bases[index].current_spirit_cost,
					controlledBy: (index) => memory.players.indexOf(memory.bases[index].control),
				},
				stars: {
					count: () => memory.stars.length,
					nameAlloc: (index) => strToPtr(memory.stars[index].id), // wasm side is responsible for deallocating!
					positionX: (index) => memory.stars[index].position[0],
					positionY: (index) => memory.stars[index].position[1],
					position: (index) => [ memory.stars[index].position[0], memory.stars[index].position[1] ],
					energyCapacity: (index) => memory.stars[index].energy_capacity,
					energyGenFlat: (index) => memory.stars[index].regeneration,
					energyGenScaling: (index) => memory.stars[index].regeneration / 100,
					energy: (index) => memory.stars[index].energy,
					activeAt: (index) => memory.stars[index].active_at,
				},
				outposts: {
					count: () => memory.outposts.length,
					nameAlloc: (index) => strToPtr(memory.outposts[index].id), // wasm side is responsible for deallocating!
					positionX: (index) => memory.outposts[index].position[0],
					positionY: (index) => memory.outposts[index].position[1],
					position: (index) => [ memory.outposts[index].position[0], memory.outposts[index].position[1] ],
					energyCapacity: (index) => memory.outposts[index].energy_capacity,
					energy: (index) => memory.outposts[index].energy,
					range: (index) => memory.outposts[index].range,
					controlledBy: (index) => memory.players.indexOf(memory.outposts[index].control),
				},
				pylons: {
					count: () => memory.pylons.length,
					nameAlloc: (index) => strToPtr(memory.pylons[index].id),
					positionX: (index) => memory.pylons[index].position[0],
					positionY: (index) => memory.pylons[index].position[1],
					position: (index) => [ memory.pylons[index].position[0], memory.pylons[index].position[1] ],
					energyCapacity: (index) => memory.pylons[index].energy_capacity,
					energy: (index) => memory.pylons[index].energy,
					controlledBy: (index) => memory.players.indexOf(memory.pylons[index].control),
				},
				players: {
					count: () => memory.players.length,
					nameAlloc: (index) => strToPtr(memory.players[index].id), // wasm side is responsible for deallocating!
					me: () => memory.players.indexOf(memory.player_id),
				},
				console: {
					log: (strPtr) => console.log(ptrToStr(strPtr)),
				},
				graphics: {
					color: (r, g, b, a) => graphics.style = `rgba(${r},${g},${b},${a})`,
					lineWidth: (w) => graphics.linewidth = w,
					circle: (x, y, r) => graphics.circle([x, y], r),
					line: (x1, y1, x2, y2) => graphics.line([x1, y1], [x2, y2]),
					rectangle: (x1, y1, w, h) => graphics.rect([x1, y1], [w, h]),
				},
				random: {
					random: () => Math.random(),
				},
			};

			let bin = atob("__CONTENTS__");
			if (bin[0]["charCodeAt"])	// hack to detect if we're in a browser
				bin = Uint8Array.from(bin, c => c.charCodeAt(0));
			const wasm = new WebAssembly.Module(bin);
			const inst = new WebAssembly.Instance(wasm, importObject);
			memory.wasm_memory = inst.exports.memory;
			memory.wasm_tick_fn = inst.exports.tick;
			memory.wasm_cache = "__UNIQUE__";
			memory.wasm_alloc_fn = inst.exports.alloc;
			console.log(`compiled new wasm script in ${new Date().getTime() - startCompile}ms`);
		} catch (e) {
			console.log(e);
		}
	}

	memory.wasm_tick_fn(tick, !memory.wasm_initialized);
	memory.wasm_initialized = true;

	console.log(`${new Date().getTime()-startTime}ms`);
}

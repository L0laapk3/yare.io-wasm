

const fs = require('fs');
const contents = fs.readFileSync(process.argv[2], {encoding: 'base64'});
const unique = new Date().getTime();

fs.writeFileSync("bot.js", `\
memory.spirits = Object.values(spirits);
if (memory.wasm_cache != ${unique}) {
	buff = Buffer.from("${contents}", "base64");
	arr = new Uint8Array(buff.length);
	for (let i = 0; i < buff.length; ++i)
		arr[i] = buff[i];
	importObject = {
        imports: {
            energize: function(from, to) {
                memory.spirits[from].energize(spirits[to]);
            },
            move: function(from, x, y) {
                memory.spirits[from].move([x, y]);
            },
            merge: function(from, to) {
                memory.spirits[from].merge(spirits[to]);
            },
            divide: function(from) {
                memory.spirits[from].divide();
            },
            jump: function(from, x, y) {
                memory.spirits[from].jump([x, y]);
            },
        }
	};

	wasm = new WebAssembly.Module(arr);
	inst = new WebAssembly.Instance(wasm, importObject);
	memory.wasm_tick = inst.exports.tick;
	memory.wasm_cache = ${unique};
	console.log("compiled new wasm script");
}

memory.wasm_tick();
`);
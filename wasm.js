

const fs = require('fs');
const contents = fs.readFileSync(process.argv[2], {encoding: 'base64'});
const unique = new Date().getTime();

fs.writeFileSync("bot.js", `\
x = 0;
if (memory.wasm_cache != ${unique}) {
	buff = Buffer.from("${contents}", "base64");

	arr = new Uint8Array(buff.length);
	for (let i = 0; i < buff.length; ++i)
		arr[i] = buff[i];

	importObject = { 	
		imports: {
			imported_func: function(u) {
				x = u;
			}
		}
	};

	wasm = new WebAssembly.Module(arr);
	inst = new WebAssembly.Instance(wasm, importObject);
	memory.wasm_run = inst.exports.exported_func;
	memory.wasm_cache = ${unique};
	console.log("compiled new wasm script");
}
memory.wasm_run();
console.log(x);
`);
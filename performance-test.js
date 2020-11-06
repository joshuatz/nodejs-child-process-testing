const {getPersistentShell} = require('./persistent-shell');

/** @typedef {'execSync' | 'exec' | 'spawn' | 'spawnSync' | 'spawnWithShell' | 'persistentShellWithCapture' | 'persistentShell'} Tests */

/**
 * @param {number} iterations
 * @param {string} cmd
 * @param {Partial<Record<Tests, boolean>>} [enabled]
 */
const perfTest = async (iterations, cmd, enabled) => {
	const childProcess = require('child_process');
	const getTimer = () => {
		let start = new Date().getTime();
		const reset = () => {
			start = new Date().getTime();
		}
		return {
			start: reset,
			reset: reset,
			getElapsed: () => {
				const now = new Date().getTime();
				return now - start;
			}
		}
	}
	/** @type {Record<Tests, {time: number, output: string}>} */
	const results = {
		execSync: {
			time: 0,
			output: ''
		},
		exec: {
			time: 0,
			output: ''
		},
		spawn: {
			time: 0,
			output: ''
		},
		spawnSync: {
			time: 0,
			output: ''
		},
		spawnWithShell: {
			time: 0,
			output: ''
		},
		persistentShell : {
			time: 0,
			output: ''
		},
		persistentShellWithCapture: {
			time: 0,
			output: ''
		}
	}
	const timer = getTimer();
	timer.start();
	// Test with standard child_process.execSync
	if (enabled.execSync !== false) {
		timer.reset();
		for (let x=0; x<iterations; x++) {
			results.execSync.output += childProcess.execSync(cmd).toString();
		}
		results.execSync.time = timer.getElapsed();
	}
	// Test with standard child_process.exec (promise)
	if (enabled.exec !== false) {
		timer.reset();
		const execPromiseArr = [];
		for (let x=0; x<iterations; x++) {
			execPromiseArr.push(new Promise((res) => {
				childProcess.exec(cmd, (err, data) => {
					results.exec.output += data;
					res(data);
				});
			}));
		}
		await Promise.all(execPromiseArr);
		results.exec.time = timer.getElapsed();
	}
	// Test with spawn
	const cmdParts = cmd.split(' ');
	const args = cmdParts.length > 1 ? cmdParts.slice(1) : [];
	if (enabled.spawn !== false) {
		timer.reset();
		const spawnPromiseArr = [];
		for (let x=0; x<iterations; x++) {
			spawnPromiseArr.push(new Promise((res) => {
				const spawnedProc = childProcess.spawn(cmdParts[0], args);
				spawnedProc.stdout.on('data', data => {
					results.spawn.output += data.toString();
					res();
				});
			}));
		}
		await Promise.all(spawnPromiseArr);
		results.spawn.time = timer.getElapsed();
	}
	if (enabled.spawnSync !== false) {
		timer.reset();
		for (let x=0; x<iterations; x++) {
			results.spawn.output += childProcess.spawnSync(cmdParts[0], args).stdout;
		}
		results.spawnSync.time = timer.getElapsed();
	}
	if (enabled.spawnWithShell !== false) {
		timer.reset();
		const spawnPromiseArr = [];
		for (let x=0; x<iterations; x++) {
			spawnPromiseArr.push(new Promise((res) => {
				const spawnedProc = childProcess.spawn(cmdParts[0], args, {
					shell: true
				});
				spawnedProc.stdout.on('data', data => {
					results.spawnWithShell.output += data.toString();
					res();
				});
			}));
		}
		await Promise.all(spawnPromiseArr);
		results.spawnWithShell.time = timer.getElapsed();
	}
	// Test with reused shell
	if (enabled.persistentShell !== false) {
		// Test with no individual cmd listeners
		const shell = getPersistentShell();
		timer.reset();
		for (let x=0; x<iterations; x++) {
			shell.execCmdWithoutCapture(cmd);
		}
		shell.process.stdin.emit('end');
		results.persistentShell.output = await shell.finalResult;
		results.persistentShell.time = timer.getElapsed();
	}
	if (enabled.persistentShellWithCapture !== false) {
		// Test with individual command listeners
		// const shell = getPersistentShell('C:/Program Files/Git/usr/bin/sh.exe');
		const shell = getPersistentShell();
		timer.reset();
		for (let x=0; x<iterations; x++) {
			shell.execCmd(cmd);
		}
		shell.process.stdin.emit('end');
		results.persistentShellWithCapture.output = await shell.finalResult;
		results.persistentShellWithCapture.time = timer.getElapsed();
	}
	return results;
}

// Read in iterations from args
const args = process.argv.slice(2);
let ITERATIONS = 40;
if (args[0]) {
	const reqIterations = parseInt(args[0], 10);
	if (!isNaN(reqIterations)) {
		ITERATIONS = reqIterations;
	}
}
perfTest(ITERATIONS, 'ls', {
	// exec: false,
	// execSync: false,
	// persistentShell: false,
	// persistentShellWithCapture: false,
	// spawn: false,
	// spawnWithShell: true
}).then((res) => {
	Object.keys(res).forEach(k => {
		delete res[k].output;
	});
	console.log(`Iterations = ${ITERATIONS}`, res);
});


/**
 * @example - Result for x200 iterations, cmd = `ls`
 * 
$ node performance-test.js 200
Iterations = 200 {
  execSync: { time: 8982 },
  exec: { time: 2634 },
  spawn: { time: 1892 },
  spawnSync: { time: 5399 },
  spawnWithShell: { time: 2579 },
  persistentShell: { time: 5770 },
  persistentShellWithCapture: { time: 5008 }
}
 */
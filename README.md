## NodeJS - child_process testing / scratchpad
Don't take this repo too seriously; mostly just a place for me to work out some ideas and understand `child_process` a little better.

## NodeJS Source Code
Looking at [the source code](https://github.com/nodejs/node) can really help clear up some of the "magic" around child_process:

 - [/lib/child_process.js](https://github.com/nodejs/node/blob/v14.15.0/lib/child_process.js) (what we, as devs, call)
 - [/lib/internal/child_process.js](https://github.com/nodejs/node/blob/v14.15.0/lib/internal/child_process.js) (internal, used by the public child_process)

## Libraries
For an easier to grok wrapper around `child_process`, with improved usability, you probably want to check out Sindre's [execa package](https://github.com/sindresorhus/execa).

## Related Notes
 - Persistent shell / child_process performance notes
	 - https://joshuatz.com/posts/2020/keep-a-shell-open-in-nodejs-and-reuse-for-multiple-commands
 - My [NodeJS Cheatsheet / Notes](https://cheatsheets.joshuatz.com/cheatsheets/node-and-npm/node-general/)
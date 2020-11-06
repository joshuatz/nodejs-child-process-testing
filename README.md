## NodeJS - child_process testing / scratchpad
Don't take this repo too seriously; mostly just a place for me to work out some ideas and understand `child_process` a little better.

## NodeJS Source Code
Looking at [the source code](https://github.com/nodejs/node) can really help clear up some of the "magic" around child_process:

 - [/lib/child_process.js](https://github.com/nodejs/node/blob/v14.15.0/lib/child_process.js) (what we, as devs, call)
 - [/lib/internal/child_process.js](https://github.com/nodejs/node/blob/v14.15.0/lib/internal/child_process.js) (internal, used by the public child_process)
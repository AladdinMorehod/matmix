"use strict";
const ENGINE = require("./tile-adhesive-batch1-engine");
if (require.main === module) ENGINE.run("core").catch(error => { console.error(`TILE_ADHESIVE_H2_ABORTED: ${error.message}`); process.exitCode = 1; });
module.exports = ENGINE;

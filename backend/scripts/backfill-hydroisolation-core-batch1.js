"use strict";
const { run } = require("./hydroisolation-batch1-engine");
if (require.main === module) run("core").catch(error => { console.error(`HYDRO H2 ABORTED: ${error.message}`); process.exitCode = 1; });
module.exports = { run: (...args) => run("core", ...args) };

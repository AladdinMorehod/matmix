"use strict";
const { run } = require("./hydroisolation-batch1-engine");
if (require.main === module) run("template").catch(error => { console.error(`HYDRO H1 ABORTED: ${error.message}`); process.exitCode = 1; });
module.exports = { run: (...args) => run("template", ...args) };

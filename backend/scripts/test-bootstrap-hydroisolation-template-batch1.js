"use strict";
require("./test-hydroisolation-batch1-shared").runTests("H1").catch(e=>{console.error(e.stack||e);process.exitCode=1;});

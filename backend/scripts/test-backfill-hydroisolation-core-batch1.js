"use strict";
require("./test-hydroisolation-batch1-shared").runTests("H2").catch(e=>{console.error(e.stack||e);process.exitCode=1;});

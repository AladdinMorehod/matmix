const { main } = require("./apply-catalog-fixes");

main().catch(error => {
    console.error("fix-plywood-groups error:", error);
    process.exit(1);
});

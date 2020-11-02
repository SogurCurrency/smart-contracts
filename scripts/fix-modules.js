const fs = require("fs");
const df = require("download-file");

try {
    fs.closeSync(fs.openSync("./node_modules/run-once", "wx"));
}
catch (error) {
    console.error("This script should not run more than once");
    process.exit();
}

function fix(fileName, tokens) {
    console.log("Fixing " + fileName);
    let data = fs.readFileSync(fileName, {encoding: "utf8"});
    for (const token of tokens)
        data = data.split(token.prev).join(token.next);
    fs.writeFileSync(fileName, data, {encoding: "utf8"});
}

fix("./node_modules/truffle/build/cli.bundled.js", [
    {prev: "request = new XHR2", next: "request = new XMLHttpRequest"},
    {prev: "error = errors.InvalidResponse", next: "error = payload.method === 'evm_revert' || payload.method === 'evm_snapshot' ? null : errors.InvalidResponse"},
    {prev: "display_path = \".\" + path.sep + path.relative(options.working_directory, import_path);", next: "if (options.fix_paths) {display_path = \".\" + path.sep + path.relative(options.working_directory, import_path); result[display_path] = result[import_path]; delete result[import_path];}"}]
);

fix("./node_modules/solidity-coverage/lib/app.js", [
    {prev: "events.push", next: "coverage.processEvent"}]
);

fix("./node_modules/solidity-coverage/lib/coverageMap.js", [
    {prev: "  generate(events, pathPrefix) {", next: "  processEvent(line) {"},
    {prev: "    for (let idx = 0; idx < events.length; idx++) {", next: ""},
    {prev: "      const event = JSON.parse(events[idx]);", next: "      const event = JSON.parse(line);"},
    {prev: "    // Finally, interpret the assert pre/post events", next: "  generate(events, pathPrefix) {"}]
);

for (const filename of ["Ownable.sol", "Claimable.sol"]) {
    const url = "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/v1.12.0/contracts/ownership/" + filename;
    const options = {directory: "./node_modules/openzeppelin-solidity-v1.12.0/contracts/ownership/", filename: filename};
    console.log("Installing " + options.directory + options.filename);
    df(url, options, function(error) {if (error) throw error;});
}
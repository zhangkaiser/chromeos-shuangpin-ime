
let child_process = require("child_process");

const paths = {
  old_decoder: "dist/old_decoder/",
  decoder: "dist/decoder/",
  ime: "dist/ime/",
}

function execCompressToZip(srcPath, name) {
  let fileName = `../${name}.zip`;
  child_process.exec(`cd ${srcPath} && rm ${fileName} && zip -r -q -o ${fileName} .`);
}

function compress() {
  Object.entries(paths).forEach((item) => {
    execCompressToZip(item[1], item[0]);
  })
}

module.exports = {
  run: compress
}

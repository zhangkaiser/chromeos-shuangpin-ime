let child_process = require("child_process");
let fs = require("fs");

const outputPath = "dist/old_decoder";

function updateManifestFile() {
  let manifestFile = outputPath + "/manifest.json";
  return new Promise((resolve, reject) => {
    fs.readFile(manifestFile, "utf8", (err, data) => {
      if (err) return reject(err);
      data = {
        ...JSON.parse(data),
        name: "IME Decoder(background)",
        minimum_chrome_version: "88",
        content_security_policy: {}
      }
      fs.writeFile(manifestFile, JSON.stringify(data), (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  })
  
}

function oldPlatformSupport() {
  return new Promise((resolve, reject) => {
    child_process.exec("rm -r dist/old_decoder && cp -r dist/decoder dist/old_decoder", (err, stdout, stderr) => {
      if (err) return reject(err);
      if (!stderr) {
        updateManifestFile().then(resolve, reject);
      }
    });
  })
  
}


module.exports = {
  run: oldPlatformSupport
}

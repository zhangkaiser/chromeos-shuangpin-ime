let old = require("./old_platform_support");
let compress = require("./compress");


old.run().then(() => {
  compress.run();
})
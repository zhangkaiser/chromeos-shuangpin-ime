

function initFS() {
  FS.mkdir("/user");
  FS.mount(IDBFS, {}, "/user");

  FS.syncfs(true, (err) => err && console.error(err));
}

Module['refreshFS'] = () => {
  FS.syncfs(false, (err) => err && console.error(err));
}

Module.preRun.unshift(initFS);
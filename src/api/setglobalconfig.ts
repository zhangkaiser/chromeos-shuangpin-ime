
import setChromeOSConfig from "src/api/chromeos/config";
import setVscodeConfig from "src/api/vscode/config";
import setWebConfig from "src/api/web/config";

// Tree-shaking support.
if (process.env.CHROME_OS) {
  setChromeOSConfig();
} else if (process.env.VSCODE) {
  setVscodeConfig();
} else if (process.env.WEB) {
  setWebConfig();
} else {
  // Pass.
}

export const imeConfig = globalThis.IMEConfig;
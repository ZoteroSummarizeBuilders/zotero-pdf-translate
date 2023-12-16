import { config } from "../../package.json";
import { SERVICES } from "../utils/config";
import { getString } from "../utils/locale";
import { getPref, setPref } from "../utils/prefs";
import { setServiceSecret, validateServiceSecret } from "../utils/secret";
import { secretStatusButtonData } from "./settings";

export function registerPrefsWindow() {
  ztoolkit.PreferencePane.register({
    pluginID: config.addonID,
    src: rootURI + "chrome/content/preferences.xhtml",
    label: getString("pref-title"),
    image: `chrome://${config.addonRef}/content/icons/favicon.png`,
    defaultXUL: true,
  });
}

export function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  addon.data.prefs.window = _window;
}

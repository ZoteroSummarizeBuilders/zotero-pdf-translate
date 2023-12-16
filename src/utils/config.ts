import { franc } from "franc";
import ISO6393_3_TO_2 = require("iso639-js/alpha3to2mapping.json");
import ISO6393_MACRO_LANGS = require("iso639-js/reference/iso639-3-macrolanguages.json");

interface TranslateService {
  type: "word" | "sentence";
  id: string;
  defaultSecret?: string;
  secretValidator?: (secret: string) => SecretValidateResult;
}

export interface SecretValidateResult {
  secret: string;
  status: boolean;
  info: string;
}

export const SERVICES: Readonly<Readonly<TranslateService>[]> = <const>[
  {
    type: "sentence",
    id: "chatgpt",
    defaultSecret: "",
    secretValidator(secret: string) {
      const status = secret.length === 51 && /^sk-/.test(secret);
      const empty = secret.length === 0;
      return {
        secret,
        status,
        info: empty
          ? "The secret is not set."
          : status
            ? "Click the button to check connectivity."
            : "Ths secret key format is invalid.",
      };
    },
  },
];

export function getService(id: string) {
  return SERVICES[SERVICES.findIndex((service) => service.id === id)];
}

export const SVGIcon = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" width="16" height="16" xml:space="preserve">
<style type="text/css">
.st0{fill:#64B5F6;}
.st1{fill:#1E88E5;}
</style>
<g>
<path class="st0" d="M4.4,11.1h1.4c0.1,0,0.2-0.1,0.1-0.2L5.2,8.7c0-0.1-0.2-0.1-0.3,0l-0.7,2.2C4.2,11,4.3,11.1,4.4,11.1L4.4,11.1
 z M4.4,11.1"/>
<path class="st0" d="M8.8,5H1.4C0.6,5,0,5.7,0,6.4v8.2C0,15.4,0.6,16,1.4,16h7.4c0.8,0,1.4-0.6,1.4-1.4V6.4C10.2,5.7,9.5,5,8.8,5
 L8.8,5z M7.9,14.2c-0.1,0.1-0.2,0.2-0.3,0.2c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.2,0C7,14.3,7,14.2,7,14.1l-0.6-1.9
 C6.3,12,6.2,12,6.1,12H4c-0.1,0-0.1,0-0.2,0.1l-0.6,2c-0.1,0.1-0.1,0.2-0.3,0.3c-0.1,0.1-0.3,0.1-0.4,0.1c-0.2,0-0.3-0.1-0.3-0.2
 c0-0.1-0.1-0.2,0-0.4l2.1-6.4c0.1-0.3,0.4-0.5,0.7-0.5h0c0.3,0,0.6,0.2,0.7,0.5l0,0l2.1,6.5C8,14,8,14.1,7.9,14.2L7.9,14.2z
  M7.9,14.2"/>
<path class="st1" d="M14.3,0H7.5C6.6,0,5.8,0.8,5.8,1.7v2.1C5.8,4,6,4.1,6.1,4.1H8c0.3,0,0.5,0,0.7,0.1C8.6,3.9,8.6,3.7,8.5,3.4
 H7.6C7.4,3.4,7.3,3.3,7.3,3c0-0.3,0.1-0.5,0.3-0.5h2.8c-0.1-0.3-0.2-0.5-0.2-0.7c0-0.2,0.1-0.4,0.3-0.5c0.3-0.1,0.4,0,0.6,0.2
 c0,0.1,0.1,0.3,0.2,0.6c0.1,0.2,0.1,0.4,0.1,0.4h2.4c0.3,0,0.4,0.2,0.4,0.5c0,0.3-0.1,0.5-0.4,0.5h-0.6c-0.1,0-0.1,0-0.1,0
 C12.8,4.9,12.3,6,11.6,7c0.6,0.5,1.3,0.9,2.3,1.3c0.3,0.1,0.3,0.3,0.3,0.6c-0.1,0.2-0.3,0.3-0.6,0.2c-0.9-0.3-1.8-0.8-2.5-1.3v2.9
 c0,0.2,0.1,0.3,0.3,0.3h3c0.9,0,1.7-0.8,1.7-1.7V1.7C16,0.8,15.2,0,14.3,0L14.3,0z M14.3,0"/>
<path class="st1" d="M12,3.4H9.6c-0.1,0-0.2,0.1-0.1,0.2C9.6,4,9.7,4.4,9.9,4.8c0,0,0,0,0,0.1c0.4,0.3,0.7,0.8,0.9,1.2
 c0.2,0,0.1,0,0.3,0c0.5-0.8,0.9-1.6,1.1-2.5C12.1,3.5,12.1,3.4,12,3.4L12,3.4z M12,3.4"/>
</g>
</svg>`;

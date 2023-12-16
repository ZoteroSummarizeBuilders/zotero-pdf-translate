import { getString, initLocale } from "./utils/locale";
import {
  registerPrefsScripts,
  registerPrefsWindow,
} from "./modules/preferenceWindow";
// import { registerNotify } from "./modules/notify";
import { registerReaderInitializer } from "./modules/reader";
import { getPref, setPref } from "./utils/prefs";
import {
  addTranslateAnnotationTask,
  addTranslateTask,
  addTranslateTitleTask,
  getLastTranslateTask,
  TranslateTask,
} from "./utils/task";
import { setDefaultPrefSettings } from "./modules/defaultPrefs";
import Addon from "./addon";
import { config } from "../package.json";
import { registerPrompt } from "./modules/prompt";
import { createZToolkit } from "./utils/ztoolkit";
import { randomInt } from "crypto";

// 要約結果の辞書型配列
// * idを指定するとその論文の要約を返す
const summaries: { [id: string]: string } = {};

function registerLibraryTabPanel() {
  const tabId = ztoolkit.LibraryTabPanel.register(
    "要約",
    (panel: XUL.Element, win: Window) => {
      const elem = ztoolkit.UI.createElement(win.document, "vbox", {
        children: [
          {
            tag: "h2",
            properties: {
              innerText: "要約",
            },
          },
          {
            id: "generated-summary",
            tag: "div",
            properties: {
              innerText: "ここに要約文が出力されます。",
            },
          },
        ],
      });
      panel.append(elem);
    },
    {
      targetIndex: 1,
    },
  );
}

// pdf文書の全文の取得
const FullText = async () => {
  const item = ZoteroPane.getSelectedItems()[0];
  const fulltext: string[] = [];
  if (item.isRegularItem()) {
    // not an attachment already
    const attachmentIDs = item.getAttachments();
    for (const id of attachmentIDs) {
      const attachment = Zotero.Items.get(id);
      if (
        attachment.attachmentContentType == "application/pdf" ||
        attachment.attachmentContentType == "text/html"
      ) {
        const text = await attachment.attachmentText;
        fulltext.push(text);
        return fulltext.toString();
      }
    }
  }
};

// ChatGPT の要約結果
function GPT_summary(item: Zotero.Item) {
  const abstract = item.getField("abstractNote");
  // addon.data.translate.selectedText = "I love bananas. It is nice!!";
  addon.data.translate.selectedText = abstract.toString();
  if (!addon.data.translate.selectedText) {
    window.alert("selectedText is empty.");
  }
  let task = getLastTranslateTask();

  if (!task) {
    task = addTranslateTask(addon.data.translate.selectedText);

    window.alert(
      "addTranslateTask-->" +
        task +
        "\nselectedText-->" +
        addon.data.translate.selectedText,
    );

    if (!task) {
      return "Not yet. I'm sorry!";
    }
  }

  return task.result || "Not yet. I'm sorry!";
}

// ChatGPT のタグ付け結果の配列
function GPT_tag() {
  return [
    "ChatGPTがつけたタグ1",
    "ChatGPTがつけたタグ2",
    "ChatGPTがつけたタグ3",
  ];
}

// ここに「pdfが読み込まれた時に実行される関数」を記述する
function onLoadingPdf(id: string) {
  const item = ZoteroPane.getSelectedItems()[0];
  // const item = ZoteroPane.item
  // window.alert(item.id);
  if (summaries[id] == undefined) {
    summaries[id] = GPT_summary(item);
    // window.alert(
    //   "id:" + id + "の論文に要約を追加"
    // );
  }
  const summary = window.document.getElementById("generated-summary");
  if (summary != null) {
    summary.innerHTML = summaries[id];
  }
  for (const tag of GPT_tag()) {
    //item.addTag(tag);
  }
}

// ここに「論文を選択したときに実行される関数」を記述する
function onSelectItem() {
  const item = ZoteroPane.getSelectedItems()[0];
  const summary = window.document.getElementById("generated-summary");
  if (item && summary) {
    summary.innerText = summaries[item.id];
    // window.alert(summary.innerText);
  }
  // window.alert("ID: " + item.id + " のpdfが選択されました");
}

function registerNotify() {
  const callback = {
    notify: async (
      event: string,
      type: string,
      ids: number[] | string[],
      extraData: { [key: string]: any },
    ) => {
      // ztoolkit.log({ type });
      if (type == "item") {
        for (const id of ids) {
          //ここに実行したい関数を追加
          onLoadingPdf(id.toString());
        }
      }
      if (!addon?.data.alive) {
        unregisterNotify(notifyID);
        return;
      }
      addon.hooks.onNotify(event, type, ids, extraData);
    },
  };

  function onPreview() {
    //window.alert()
  }

  // Register the callback in Zotero as an item observer
  const notifyID = Zotero.Notifier.registerObserver(callback, [
    "tab",
    "item",
    "file",
  ]);
}

function unregisterNotify(notifyID: string) {
  Zotero.Notifier.unregisterObserver(notifyID);
}

async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);
  initLocale();

  setDefaultPrefSettings();

  registerReaderInitializer();

  // registerNotify(["item"]);
  registerNotify();
  await onMainWindowLoad(window);
}

// Zoteroの起動時
async function onMainWindowLoad(win: Window): Promise<void> {
  await new Promise((resolve) => {
    if (win.document.readyState !== "complete") {
      win.document.addEventListener("readystatechange", () => {
        if (win.document.readyState === "complete") {
          resolve(void 0);
        }
      });
    }
    resolve(void 0);
  });

  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);
  // Create ztoolkit for every window
  addon.data.ztoolkit = createZToolkit();
  registerPrefsWindow();
  registerPrompt();
  registerLibraryTabPanel();
  // onLoadingPdf();

  initListener();
}

function initListener() {
  window.addEventListener("mousedown", onSelectItem);
}

async function onMainWindowUnload(win: Window): Promise<void> {
  ztoolkit.unregisterAll();
}

function onShutdown(): void {
  ztoolkit.unregisterAll();
  // Remove addon object
  addon.data.alive = false;
  delete Zotero[config.addonInstance];
}

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this function clear.
 */
function onNotify(
  event: string,
  type: string,
  ids: Array<string | number>,
  extraData: { [key: string]: any },
) {
  if (event === "add" && type === "item") {
    const annotationItems = Zotero.Items.get(ids as number[]).filter((item) =>
      item.isAnnotation(),
    );
    if (annotationItems.length === 0) {
      return;
    }
    if (getPref("enableComment")) {
      addon.hooks.onTranslateInBatch(
        annotationItems
          .map((item) => addTranslateAnnotationTask(item.id))
          .filter((task) => task) as TranslateTask[],
        { noDisplay: true },
      );
    }
  } else {
    return;
  }
}

function onPrefsLoad(event: Event) {
  registerPrefsScripts((event.target as any).ownerGlobal);
}

function onShortcuts(type: string) {
  switch (type) {
    case "library":
      {
        addon.hooks.onSwitchTitleColumnDisplay();
        addon.hooks.onTranslateInBatch(
          ZoteroPane.getSelectedItems(true)
            .map((id) => addTranslateTitleTask(id, true))
            .filter((task) => task) as TranslateTask[],
          { noDisplay: true },
        );
      }
      break;
    case "reader":
      {
        addon.hooks.onTranslate(undefined, {
          noCheckZoteroItemLanguage: true,
        });
      }
      break;
    default:
      break;
  }
}

async function onTranslate(): Promise<void>;
async function onTranslate(
  options: Parameters<
    Addon["data"]["translate"]["services"]["runTranslationTask"]
  >["1"],
): Promise<void>;
async function onTranslate(
  task: TranslateTask | undefined,
  options?: Parameters<
    Addon["data"]["translate"]["services"]["runTranslationTask"]
  >["1"],
): Promise<void>;
async function onTranslate(...data: any) {
  let task = undefined;
  let options = {};
  if (data.length === 1) {
    if (data[0].raw) {
      task = data[0];
    } else {
      options = data[0];
    }
  } else if (data.length === 2) {
    task = data[0];
    options = data[1];
  }
  await addon.data.translate.services.runTranslationTask(task, options);
}

async function onTranslateInBatch(
  tasks: TranslateTask[],
  options: Parameters<
    Addon["data"]["translate"]["services"]["runTranslationTask"]
  >["1"] = {},
) {
  for (const task of tasks) {
    await addon.hooks.onTranslate(task, options);
    await Zotero.Promise.delay(addon.data.translate.batchTaskDelay);
  }
}

function onSwitchTitleColumnDisplay() {
  setPref(
    "titleColumnMode",
    getPref("titleColumnMode") === "raw" ? "result" : "raw",
  );
  ztoolkit.ItemTree.refresh();
}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintain.

export default {
  onStartup,
  onMainWindowLoad,
  onMainWindowUnload,
  onShutdown,
  onNotify,
  onPrefsLoad,
  onShortcuts,
  onTranslate,
  onTranslateInBatch,
  onSwitchTitleColumnDisplay,
};

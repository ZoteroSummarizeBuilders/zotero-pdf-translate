import { getString, initLocale } from "./utils/locale";
import {
  registerPrefsScripts,
  registerPrefsWindow,
} from "./modules/preferenceWindow";
// import { registerNotify } from "./modules/notify";
import { getPref, setPref } from "./utils/prefs";
import {
  addTranslateTask,
  getLastTranslateTask,
  TranslateTask,
} from "./utils/task";
import { setDefaultPrefSettings } from "./modules/defaultPrefs";
import Addon from "./addon";
import { config } from "../package.json";
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
        styles: { maxWidth: "300px" },
        children: [
          {
            tag: "h2",
            properties: {
              innerText: "要約",
            },
          },
          {
            id: "summary-button-pdf",
            tag: "button",
            properties: {
              innerText: "PDF",
            },
            styles: {
              width: "300px",
              // height: "50px",
              minWidth: "300px",
              maxWidth: "300px",
            },
          },
          {
            id: "summary-button-html",
            tag: "button",
            properties: {
              innerText: "html",
            },
            styles: {
              width: "300px",
              // height: "50px",
              minWidth: "300px",
              maxWidth: "300px",
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
      // const elem2 = ztoolkit.UI.createElement(win.document, "vbox",{
      //   styles:{maxWidth: "300px"},
      //   children: [
      //     {
      //       id: "generated-summary",
      //       tag: "div",
      //       properties: {
      //         innerText: "ここに要約文が出力されます。",
      //       },
      //     },
      //   ],
      // });
      // panel.append(elem2);
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

// 文字列を指定された文字数ごとに改行して表示
function splitString(string: string, length: number) {
  const result = [];
  while (string.length > 0) {
    result.push(string.substring(0, length));
    string = string.substring(length);
  }
  return splitString(result.join("<br></br>"), 40);
}

// idからitemに入ってるpdfとhtmlの全文の取得
async function FullTextfromid(id: string): Promise<string> {
  const item = Zotero.Items.get(id);
  const fulltext: string[] = [];
  if (item.isRegularItem()) {
    // not an attachment already
    const attachmentIDs = item.getAttachments();
    // window.alert("attachmentIDs are #"+ attachmentIDs.toString()+"#");
    if (attachmentIDs.toString().length > 0) {
      for (const id_text of attachmentIDs) {
        const attachment = Zotero.Items.get(id_text);
        // window.alert("attachment is "+ attachment.toString());
        if (
          attachment.attachmentContentType == "application/pdf" ||
          attachment.attachmentContentType == "text/html"
        ) {
          const text = await attachment.attachmentText;
          fulltext.push(text);
          window.alert("fulltext is " + text);
        }
      }
    } else {
      // fulltext.push("Attachment contents may not be pdf or html or nothig!!");
      window.alert("Attachment contents may not be pdf or html or nothig!!");
      return fulltext.join(", ");
    }
  }
  // return splitString(fulltext.join(", "), 40);
  return fulltext.join(", ");
}

// idからitemに入ってるhtmlの全文の取得
async function HtmlTextfromid(id: string): Promise<string> {
  const item = Zotero.Items.get(id);
  const fulltext: string[] = [];
  if (item.isRegularItem()) {
    // not an attachment already
    const attachmentIDs = item.getAttachments();
    // window.alert("attachmentIDs are #"+ attachmentIDs.toString()+"#");
    if (attachmentIDs.toString().length > 0) {
      for (const id_text of attachmentIDs) {
        const attachment = Zotero.Items.get(id_text);
        // window.alert("attachment is "+ attachment.toString());
        if (attachment.attachmentContentType == "text/html") {
          const text = await attachment.attachmentText;
          fulltext.push(text);
          window.alert("fulltext is " + text);
        } else {
          // fulltext.push("Attachment contents may not be pdf or html or nothig!!");
          window.alert("Attachment contents may not be html!!");
          return fulltext.join(", ");
        }
      }
    } else {
      // fulltext.push("Attachment contents may not be pdf or html or nothig!!");
      window.alert("Attachment contents may not be pdf or html or nothig!!");
      return fulltext.join(", ");
    }
  }
  // return splitString(fulltext.join(", "), 40);
  return fulltext.join(", ");
}

// idからitemに入ってるpdfの全文の取得
async function PdfTextfromid(id: string): Promise<string> {
  const item = Zotero.Items.get(id);
  const fulltext: string[] = [];
  if (item.isRegularItem()) {
    // not an attachment already
    const attachmentIDs = item.getAttachments();
    // window.alert("attachmentIDs are #"+ attachmentIDs.toString()+"#");
    if (attachmentIDs.toString().length > 0) {
      for (const id_text of attachmentIDs) {
        const attachment = Zotero.Items.get(id_text);
        // window.alert("attachment is "+ attachment.toString());
        if (attachment.attachmentContentType == "application/pdf") {
          const text = await attachment.attachmentText;
          fulltext.push(text);
          window.alert("fulltext is " + text);
        } else {
          // fulltext.push("Attachment contents may not be pdf or html or nothig!!");
          window.alert("Attachment contents may not be pdf!!");
          return fulltext.join(", ");
        }
      }
    } else {
      // fulltext.push("Attachment contents may not be pdf or html or nothig!!");
      window.alert("Attachment contents may not be pdf or html or nothig!!");
      return fulltext.join(", ");
    }
  }
  // return splitString(fulltext.join(", "), 40);
  return fulltext.join(", ");
}

// ChatGPT の要約結果
async function GPT_summary(item: Zotero.Item) {
  const title = item.getField("title");
  // addon.data.translate.selectedText = "I love bananas. It is nice!!";
  addon.data.translate.selectedText = title.toString();
  if (!addon.data.translate.selectedText) {
    window.alert("selectedText is empty.");
  }

  let task = getLastTranslateTask();
  if (!task) {
    task = addTranslateTask(addon.data.translate.selectedText);

    if (!task) {
      return "Not yet. I'm sorry!";
    }
  }

  await addon.hooks.onTranslate(task);
  // window.alert("task object: " + JSON.stringify(task, null, 2));
  // window.alert("addon: " + JSON.stringify(addon.data.translate, null, 2));

  window.alert("clearly success!!--->>>" + task.result);
  return task.result || "Not yet. I'm sorry!";
}

// ChatGPT の要約結果
async function GPT_summaryfromtext(fulltext: string) {
  addon.data.translate.selectedText = fulltext;

  if (!addon.data.translate.selectedText) {
    window.alert("selectedText is empty.");
  }

  let task = getLastTranslateTask();
  if (!task) {
    task = addTranslateTask(addon.data.translate.selectedText);

    if (!task) {
      return "Not yet. I'm sorry!";
    }
  }

  await addon.hooks.onTranslate(task);
  // window.alert("task object: " + JSON.stringify(task, null, 2));
  // window.alert("addon: " + JSON.stringify(addon.data.translate, null, 2));

  window.alert("clearly success!!--->>>" + task.result);
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
async function onLoadingPdf(id: string) {
  const item = ZoteroPane.getSelectedItems()[0];
  if (summaries[id] === undefined) {
    try {
      const summaryText = await GPT_summary(item);
      summaries[id] = summaryText;
    } catch (error) {
      const summaryText = "await error.";
    }
  }

  const summary = window.document.getElementById("generated-summary");
  if (summary != null) {
    summary.innerHTML = summaries[id];
  }
  for (const tag of GPT_tag()) {
    item.addTag(tag);
  }
}

// ここに「要約ボタンをおしたときに実行される関数」を記述する
async function clicksummarizebtn(id: string, htmlid: string) {
  const item = Zotero.Items.get(id);
  const fulltext = [];
  if (htmlid == "summary-button-pdf") {
    window.alert("push pdf button.");
    fulltext.push(await PdfTextfromid(id));
  } else if (htmlid == "summary-button-html") {
    window.alert("push html button.");
    fulltext.push(await HtmlTextfromid(id));
  }
  // const text = await FullTextfromid(id);
  const text = fulltext.toString();
  const summary_text = await GPT_summaryfromtext(text);

  if (summaries[id] == undefined) {
    // const text = await FullTextfromid(id);
    // const abstract = item.getField("abstractNote");
    // summaries[id] = await GPT_summaryfromtext(text);
    summaries[id] = summary_text;
    // summaries[id] = abstract.toString();
  }
  const summary = window.document.getElementById("generated-summary");
  if (summary != null) {
    summary.innerHTML = summaries[id];
  }

  item.addTag("1");
  // for (const tag of GPT_tag()) {
  //   item.addTag(tag);
  // }
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
          const item = Zotero.Items.get(id);
          if (item.isRegularItem()) {
            // not an attachment already
            const attachmentIDs = item.getAttachments();
            for (const id_text of attachmentIDs) {
              const attachment = Zotero.Items.get(id_text);
              if (
                attachment.attachmentContentType == "application/pdf" ||
                attachment.attachmentContentType == "text/html"
              ) {
                // onLoadingPdf(id.toString());
              }
            }
          }
        }
      }
      if (!addon?.data.alive) {
        unregisterNotify(notifyID);
        // window.alert("in unregistard notify ");
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
  registerLibraryTabPanel();
  // onLoadingPdf();

  initListener();

  //PDFボタンが押されたとき
  const btn_pdf = document.getElementById("summary-button-pdf");
  btn_pdf?.addEventListener("click", () => {
    const item = ZoteroPane.getSelectedItems()[0];
    // window.alert("btton is pushed");
    clicksummarizebtn(item.id.toString(), "summary-button-pdf");
  });

  //HTMLボタンが押されたとき
  const btn_html = document.getElementById("summary-button-html");
  btn_html?.addEventListener("click", () => {
    const item = ZoteroPane.getSelectedItems()[0];
    // window.alert("btton is pushed");
    clicksummarizebtn(item.id.toString(), "summary-button-html");
  });
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
    // if (getPref("enableComment")) {
    //   addon.hooks.onTranslateInBatch(
    //     annotationItems
    //       .map((item) => addTranslateAnnotationTask(item.id))
    //       .filter((task) => task) as TranslateTask[],
    //     { noDisplay: true },
    //   );
    // }
  } else {
    return;
  }
}

function onPrefsLoad(event: Event) {
  registerPrefsScripts((event.target as any).ownerGlobal);
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
  onTranslate,
  onTranslateInBatch,
  onSwitchTitleColumnDisplay,
};

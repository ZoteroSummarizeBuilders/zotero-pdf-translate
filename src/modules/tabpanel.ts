import { getString } from "../utils/locale";
import { config } from "../../package.json";
import { SERVICES } from "../utils/config";
import { getPref, setPref } from "../utils/prefs";
import { addTranslateTask, getLastTranslateTask } from "../utils/task";

export function registerReaderTabPanel() {
  ztoolkit.ReaderTabPanel.register(
    getString("readerpanel-label"),
    (
      panel: XUL.TabPanel | undefined,
      ownerDeck: XUL.Deck,
      ownerWindow: Window,
      readerInstance: _ZoteroTypes.ReaderInstance,
    ) => {
      if (ownerDeck.selectedPanel?.children[0].tagName === "vbox") {
        panel = createPanel(ownerDeck, readerInstance._instanceID);
      }
    },
    {
      selectPanel: getPref("autoFocus") as boolean,
    },
  ).then((tabId) => {
    addon.data.panel.tabOptionId = tabId;
  });
  new (ztoolkit.getGlobal("MutationObserver"))((_muts) => {
    updateTextAreasSize();
  }).observe(document.querySelector("#zotero-context-pane")!, {
    attributes: true,
    attributeFilter: ["width"],
  });
  document
    .querySelector("#zotero-context-pane")
    ?.querySelector("grippy")
    ?.addEventListener("click", (ev) => {
      updateTextAreasSize();
    });
  updateTextAreasSize(true);
}

export function updateReaderTabPanels() {
  ztoolkit.ReaderTabPanel.changeTabPanel(addon.data.panel.tabOptionId, {
    selectPanel: getPref("autoFocus") as boolean,
  });
  cleanPanels();
  addon.data.panel.activePanels.forEach((panel) => updatePanel(panel));
  if (addon.data.panel.windowPanel && !addon.data.panel.windowPanel.closed) {
    updateExtraPanel(addon.data.panel.windowPanel.document);
  }
  updateTextAreasSize(true);
}

function createPanel(ownerDeck: XUL.Deck, refID: string) {
  const container = ownerDeck.selectedPanel;
  container.innerHTML = "";
  ztoolkit.UI.appendElement(
    {
      tag: "tabbox",
      id: `${config.addonRef}-${refID}-extra-tabbox`,
      classList: ["zotero-view-tabbox"],
      attributes: {
        flex: "1",
      },
      ignoreIfExists: true,
      children: [
        {
          tag: "tabs",
          classList: ["zotero-editpane-tabs"],
          attributes: {
            orient: "horizontal",
          },
          children: [
            {
              tag: "tab",
              attributes: {
                label: getString("readerpanel-label"),
              },
            },
          ],
        },
        {
          tag: "tabpanels",
          classList: ["zotero-view-item"],
          attributes: {
            flex: "1",
          },
          children: [
            {
              tag: "tabpanel",
              attributes: {
                flex: "1",
              },
            },
          ],
        },
      ],
    },
    container,
  );
  return container.querySelector("tabpanel") as XUL.TabPanel;
}

function updatePanel(panel: HTMLElement) {
  const idPrefix = panel
    .querySelector(`.${config.addonRef}-panel-root`)!
    .id.split("-")
    .slice(0, -1)
    .join("-");
  const makeId = (type: string) => `${idPrefix}-${type}`;
  const updateHidden = (type: string, pref: string) => {
    const elem = panel.querySelector(`#${makeId(type)}`) as XUL.Box;
    elem.hidden = !getPref(pref) as boolean;
  };
  const setCheckBox = (type: string, checked: boolean) => {
    const elem = panel.querySelector(`#${makeId(type)}`) as XUL.Checkbox;
    elem.checked = checked;
  };
  const setValue = (type: string, value: string) => {
    const elem = panel.querySelector(`#${makeId(type)}`) as XUL.Textbox;
    elem.value = value;
  };
  const setTextBoxStyle = (type: string) => {
    const elem = panel.querySelector(`#${makeId(type)}`) as XUL.Textbox;
    elem.style.fontSize = `${getPref("fontSize")}px`;
    elem.style.lineHeight = getPref("lineHeight") as string;
  };

  updateHidden("engine", "showSidebarEngine");
  updateHidden("lang", "showSidebarLanguage");
  updateHidden("auto", "showSidebarSettings");
  updateHidden("concat", "showSidebarConcat");
  updateHidden("raw", "showSidebarRaw");
  updateHidden("splitter", "showSidebarRaw");
  updateHidden("copy", "showSidebarCopy");

  setValue("services", getPref("translateSource") as string);

  // setValue("langfrom", fromLanguage);
  // setValue("langto", toLanguage);

  setCheckBox("autotrans", getPref("enableAuto") as boolean);
  setCheckBox("autoannot", getPref("enableComment") as boolean);
  setCheckBox("concat", addon.data.translate.concatCheckbox);

  const lastTask = getLastTranslateTask();
  if (!lastTask) {
    return;
  }
  // For manually update translation task
  panel.setAttribute("translate-task-id", lastTask.id);
  const reverseRawResult = getPref("rawResultOrder");
  setValue("rawtext", reverseRawResult ? lastTask.result : lastTask.raw);
  setValue("resulttext", reverseRawResult ? lastTask.raw : lastTask.result);
  setTextBoxStyle("rawtext");
  setTextBoxStyle("resulttext");
  panel
    .querySelector(`#${makeId("splitter")}`)
    ?.setAttribute("collapse", reverseRawResult ? "after" : "before");
}

function updateExtraPanel(container: HTMLElement | Document) {
  const extraTasks = getLastTranslateTask()?.extraTasks;
  if (extraTasks?.length === 0) {
    return;
  }
  extraTasks?.forEach((task) => {
    Array.from(
      container.querySelectorAll(`.${task.service}+hbox>textarea`),
    ).forEach((elem) => ((elem as HTMLTextAreaElement).value = task.result));
  });
}

function updateTextAreaSize(
  container: HTMLElement | Document,
  noDelay: boolean = false,
) {
  const setTimeout = ztoolkit.getGlobal("setTimeout");
  Array.from(container.querySelectorAll("textarea")).forEach((elem) => {
    if (noDelay) {
      elem.style.width = `${elem.parentElement?.scrollWidth}px`;
      return;
    }
    elem.style.width = "0px";
    setTimeout(() => {
      elem.style.width = `${elem.parentElement?.scrollWidth}px`;
    }, 0);
  });
}

function updateTextAreasSize(noDelay: boolean = false) {
  cleanPanels();
  addon.data.panel.activePanels.forEach((panel) =>
    updateTextAreaSize(panel, noDelay),
  );
}

function recordPanel(panel: HTMLElement) {
  addon.data.panel.activePanels.push(panel);
}

function cleanPanels() {
  addon.data.panel.activePanels = addon.data.panel.activePanels.filter(
    (elem) => elem.parentElement && (elem as any).ownerGlobal,
  );
}

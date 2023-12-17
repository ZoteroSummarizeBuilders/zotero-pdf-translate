import { SERVICES } from "./config";
import { getString } from "./locale";
import { getPref } from "./prefs";
import { getServiceSecret } from "./secret";
import { config } from "../../package.json";

export interface TranslateTask {
  /**
   * Task id.
   */
  id: string;
  /**
   * Task type.
   */
  type: "text" | "annotation" | "title" | "abstract" | "custom";
  /**
   * Raw text for translation.
   */
  raw: string;
  /**
   * Translation result or error info.
   */
  result: string;
  /**
   * Audio resources.
   */
  audio: { text: string; url: string }[];
  /**
   * Service id.
   */
  service: string;
  /**
   * Candidate service ids.
   *
   * Only used when the run of `service` fails.
   * Generally this is for the fallback of word services.
   */
  candidateServices: string[];
  /**
   * Zotero item id.
   *
   * For language disable check.
   */
  itemId: number | undefined;
  /**
   * From language
   *
   * Generated at task runtime.
   */
  langfrom?: string;
  /**
   * To language.
   *
   * Generated at task runtime.
   */
  langto?: string;
  /**
   * Service secret.
   *
   * Generated at task runtime.
   */
  secret?: string;
  /**
   * task status.
   */
  status: "waiting" | "processing" | "success" | "fail";
  /**
   * Extra tasks.
   *
   * For extra services function.
   */
  extraTasks: TranslateTask[] & { extraTasks: [] }[];
  /**
   * Whether to mute error info, depends on the implementation of the service.
   */
  silent?: boolean;
  /**
   * Caller identifier.
   *
   * This is for translate service provider to identify the caller.
   * If not provided, the call will fail.
   */
  callerID?: string;

  text?: string;
  SummarizeResult?: string;
  TagResult?: string;
  OriginalText?: string;
}

export type TranslateTaskProcessor = (
  data: Required<TranslateTask>,
) => Promise<void> | void;

export class TranslateTaskRunner {
  protected processor: TranslateTaskProcessor;
  constructor(processor: TranslateTaskProcessor) {
    this.processor = processor;
  }

  public async run(data: TranslateTask) {
    // 呼び出し元のIDがない場合，設定ファイルからaddonIDを使用する
    data.callerID = data.callerID || config.addonID;

    // 秘密鍵の入手(あやしい？)
    data.secret = getServiceSecret(data.service);
    data.status = "processing";
    try {
      // 翻訳処理の実行
      ztoolkit.log(data);
      // this.processerで翻訳を行うはず
      await this.processor(data as Required<TranslateTask>);
      data.status = "success";
    } catch (e) {
      data.result = this.makeErrorInfo(data.service, String(e));
      data.status = "fail";
    }
  }

  // errorメッセージの作成
  protected makeErrorInfo(serviceId: string, detail: string) {
    return `${getString("service-errorPrefix")} ${getString(
      `service-${serviceId}`,
    )}\n\n${detail}`;
  }
}

export function addTranslateTask(
  raw: string,
  itemId?: number,
  type?: TranslateTask["type"],
  service?: string,
) {
  if (!raw) {
    return;
  }

  type = type || "text";
  // Filter raw string
  // eslint-disable-next-line no-control-regex
  raw = raw.replace(/[\u0000-\u001F\u007F-\u009F]/gu, " ").normalize("NFKC");

  // Append raw text to last task's raw if in concat mode
  const isConcatMode =
    type === "text" &&
    (addon.data.translate.concatCheckbox || addon.data.translate.concatKey);
  const lastTask = getLastTranslateTask({ type: "text" });
  if (isConcatMode && lastTask) {
    lastTask.raw += " " + raw;
    lastTask.extraTasks.forEach((extraTask) => (extraTask.raw += " " + raw));
    return;
  }

  // Create a new task
  const newTask: TranslateTask = {
    id: `${Zotero.Utilities.randomString()}-${new Date().getTime()}`,
    type,
    raw,
    result: "",
    audio: [],
    service: "",
    candidateServices: [],
    itemId,
    status: "waiting",
    extraTasks: [],
  };

  if (!service) {
    setDefaultService(newTask);
  } else {
    newTask.service = service;
  }

  addon.data.translate.queue.push(newTask);
  // In case window panel requires extra translations
  if (
    type === "text" &&
    addon.data.panel.windowPanel &&
    !addon.data.panel.windowPanel.closed
  ) {
    (getPref("extraEngines") as string)
      .split(",")
      .filter((s) => s)
      .forEach((extraService) =>
        newTask.extraTasks.push({
          id: `${Zotero.Utilities.randomString()}-${new Date().getTime()}`,
          type: "text",
          raw,
          result: "",
          audio: [],
          service: extraService,
          candidateServices: [],
          extraTasks: [],
          itemId,
          status: "waiting",
        }),
      );
  }
  // Keep queue size
  cleanTasks();

  return newTask;
}

function setDefaultService(task: TranslateTask) {
  task.service = getPref("translateSource") as string;

  // In case service is still empty
  task.service = task.service || SERVICES[0].id;
}

function cleanTasks() {
  if (
    addon.data.translate.queue.length > addon.data.translate.maximumQueueLength
  ) {
    addon.data.translate.queue.splice(
      0,
      Math.floor(addon.data.translate.maximumQueueLength / 3),
    );
  }
}

export function getTranslateTasks(count: number) {
  return addon.data.translate.queue.slice(-count);
}

export function getLastTranslateTask<
  K extends keyof TranslateTask,
  V extends TranslateTask[K],
>(conditions?: { [key in K]: V }) {
  const queue = addon.data.translate.queue;
  let i = queue.length - 1;
  while (i >= 0) {
    const currentTask = queue[i];
    const notMatchConditions =
      conditions &&
      Object.keys(conditions)
        .map((key) => currentTask[key as K] === conditions[key as K])
        .includes(false);
    if (!notMatchConditions) {
      return queue[i];
    }
    i--;
  }
  return undefined;
}

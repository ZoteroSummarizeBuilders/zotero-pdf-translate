/* eslint-disable no-undef */
pref("__prefsPrefix__.enableAuto", true);
pref("__prefsPrefix__.enableDict", true);
pref("__prefsPrefix__.enablePopup", true);
pref("__prefsPrefix__.enableComment", true);
pref("__prefsPrefix__.annotationTranslationPosition", "comment");
pref("__prefsPrefix__.enableNote", true);
pref("__prefsPrefix__.enableNoteReplaceMode", false);
pref("__prefsPrefix__.translateSource", "");
pref("__prefsPrefix__.dictSource", "");
pref("__prefsPrefix__.sourceLanguage", "en-US");
pref("__prefsPrefix__.targetLanguage", "");
pref("__prefsPrefix__.fontSize", "12");
pref("__prefsPrefix__.lineHeight", "1.5");
pref("__prefsPrefix__.splitChar", "\ud83d\udd24");
pref("__prefsPrefix__.autoFocus", true);
pref("__prefsPrefix__.rawResultOrder", false);
pref("__prefsPrefix__.showItemMenuTitleTranslation", true);
pref("__prefsPrefix__.showItemMenuAbstractTranslation", true);
pref("__prefsPrefix__.showSidebarEngine", true);
pref("__prefsPrefix__.showSidebarSettings", true);
pref("__prefsPrefix__.showSidebarConcat", true);
pref("__prefsPrefix__.showSidebarLanguage", true);
pref("__prefsPrefix__.showSidebarRaw", true);
pref("__prefsPrefix__.showSidebarCopy", true);
pref("__prefsPrefix__.showItemBoxTitleTranslation", true);
pref("__prefsPrefix__.showItemBoxAbstractTranslation", true);
pref("__prefsPrefix__.keepWindowTop", false);
pref("__prefsPrefix__.keepPopupSize", false);
pref("__prefsPrefix__.popupWidth", 105);
pref("__prefsPrefix__.popupHeight", 30);
pref("__prefsPrefix__.autoPlay", false);
pref("__prefsPrefix__.showPlayBtn", true);
pref("__prefsPrefix__.enableAutoDetectLanguage", true);
pref("__prefsPrefix__.disabledLanguages", "");
pref("__prefsPrefix__.extraEngines", "");
pref("__prefsPrefix__.titleColumnMode", "raw");
pref(
  "__prefsPrefix__.chatGPT.endPoint",
  "https://api.openai.com/v1/chat/completions",
);
// pref("__prefsPrefix__.chatGPT.model", "gpt-3.5-turbo");
pref("__prefsPrefix__.chatGPT.model", "gpt-3.5-turbo-1106");
pref("__prefsPrefix__.chatGPT.temperature", "1.0");
pref(
  "__prefsPrefix__.chatGPT.prompt",
  // "As an academic expert with specialized knowledge in various fields, please provide a proficient and precise translation translation from ${langFrom} to ${langTo} of the academic text enclosed in 🔤. It is crucial to maintaining the original phrase or sentence and ensure accuracy while utilizing the appropriate language. The text is as follows:  🔤 ${sourceText} 🔤  Please provide the translated result without any additional explanation and remove 🔤.",
  'As an academic expert with specialized knowledge in various fields, you have 2 tasks. First, please provide a precise summarization of the academic text within 200 words "in Japanese". Second, please suggest less than 5 tag that express the whole sentence concisely in English. It is crucial to understand the original text and extract important phrase or words. The output format is JSON, {"Summarytext" : "SummarizeResult", "Tag" : "TagResult[]"}. The object text is ##. #${OriginalText}#',
  // "You are the best scientist who can demonstrate a deep understanding of all science and technology and always lead to the right results. Read the following statement and suggest three tags that best describe its content in the format ##. #${text}#",
);

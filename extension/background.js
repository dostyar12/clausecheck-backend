chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "clausecheck-explain",
    title: "Explain this with ClauseCheck",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "clausecheck-explain" || !info.selectionText) return;

  let sent = false;
  try {
    await chrome.tabs.sendMessage(tab.id, { action: "explain", text: info.selectionText });
    sent = true;
  } catch (err) {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
      await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["content.css"] });
      await chrome.tabs.sendMessage(tab.id, { action: "explain", text: info.selectionText });
      sent = true;
    } catch (e) {}
  }

  if (!sent) {
    await chrome.tabs.create({ url: chrome.runtime.getURL("popup/popup.html") });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'watch-element',
    title: 'Element Removal Chime',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'watch-element') return;

  chrome.tabs.sendMessage(tab.id, {
    type: 'WATCH_ELEMENT'
  });
});
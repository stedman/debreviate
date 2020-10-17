const id = 'debreviate';

chrome.contextMenus.create({
  id,
  title: 'Debreviate',
  contexts: ['all']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === id) {
    chrome.tabs.sendMessage(tab.id, {id});
  }
});

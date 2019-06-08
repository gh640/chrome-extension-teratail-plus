/**
 * 共用の定数
 */
const inputId = 'usernameInput';
const listId = 'usernames';
const buttonId = 'add';
const key = 'mutedUsernames';

main();

/**
 * メイン関数
 */
function main() {

  // ユーザ一覧表示をリフレッシュ
  // add ボタンにイベントリスナーを追加
  document.addEventListener('DOMContentLoaded', refreshUsernames);
  document.getElementById(buttonId).addEventListener('click', addUsername);
}

/**
 * イベントリスナー: ユーザを追加する
 */
async function addUsername(event) {
  let username = document.getElementById(inputId).value;
  let mutedUsernames = await load(key);

  if (!mutedUsernames) {
    mutedUsernames = [];
  }

  if (!mutedUsernames.includes(username)) {
    mutedUsernames.unshift(username);
    await save(key, mutedUsernames);
    refreshUsernames();
  }

  event.preventDefault();
}

/**
 * イベントリスナー: ユーザ一覧表示をリフレッシュする
 */
async function refreshUsernames() {
  let usernamesEl = document.getElementById(listId);
  let mutedUsernames = await load(key);

  if (!mutedUsernames) {
    mutedUsernames = [];
  }

  while (usernamesEl.firstChild) {
    usernamesEl.removeChild(usernamesEl.firstChild);
  }

  mutedUsernames.forEach((username) => {
    let container = document.createElement('div');
    container.innerText = username;
    usernamesEl.appendChild(container);
  });
}

/**
 * ヘルパー: ストレージからデータを取得する
 */
function load(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (items) => {
      let error = chrome.runtime.lastError;
      if (error) {
        reject(error);
      } else {
        resolve(items[key]);
      }
    });
  });
}

/**
 * ヘルパー: ストレージにデータを保存する
 */
function save(key, value) {
  return new Promise((resolve, reject) => {
    let items = {};
    items[key] = value;
    chrome.storage.local.set(items, () => {
      let error = chrome.runtime.lastError;
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

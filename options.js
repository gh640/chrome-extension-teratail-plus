/**
 * 共用の定数
 */
const INPUT_ID = 'usernameInput';
const LIST_ID = 'usernames';
const ADD_BUTTON_ID = 'add';
const UNMUTE_BUTTON_ID = 'unmute';
const USERNAME_CLASS = 'username-row';
const USERNAME_CHECK_CLASS = 'row-check';
const USERNAME_LABEL_CLASS = 'row-label';
const KEY = 'mutedUsernames';

main();

/**
 * メイン関数
 */
function main() {

  // ユーザ一覧表示をリフレッシュ
  // add ボタンと unmute ボタンにイベントリスナーを追加
  document.addEventListener('DOMContentLoaded', refreshList);
  document.getElementById(ADD_BUTTON_ID).addEventListener('click', add);
  document.getElementById(UNMUTE_BUTTON_ID).addEventListener('click', unmute);
}

/**
 * イベントリスナー: ユーザをミュート対象に追加する
 */
async function add(event) {
  let usernameEl = document.getElementById(INPUT_ID);
  let username = usernameEl.value.trim();
  if (username) {
    let mutedUsernames = await loadMutedUsernames();

    if (!mutedUsernames.includes(username)) {
      mutedUsernames.unshift(username);
      await save(KEY, mutedUsernames);
      usernameEl.value = '';
      refreshList();
    }
  }

  event.preventDefault();
}

/**
 * イベントリスナー: 選択されたユーザをアンミュートする
 */
async function unmute(event) {
  let checkboxEls = document.getElementsByName('unmute');
  let usernamesToUnmute = [];

  for (let checkboxEl of checkboxEls) {
    if (checkboxEl.checked) {
      usernamesToUnmute.push(checkboxEl.value);
    }
  }

  let mutedUsernames = await loadMutedUsernames();
  let newMutedUsernames = [];
  for (let username of mutedUsernames) {
    if (!usernamesToUnmute.includes(username)) {
      newMutedUsernames.push(username);
    }
  }

  await save(KEY, newMutedUsernames);
  refreshList();
}

/**
 * イベントリスナー: ユーザ一覧表示をリフレッシュする
 */
async function refreshList() {
  let usernamesEl = document.getElementById(LIST_ID);
  let mutedUsernames = await loadMutedUsernames();

  // かんたんに実装するためいったんすべて削除して追加し直す
  while (usernamesEl.firstChild) {
    usernamesEl.removeChild(usernamesEl.firstChild);
  }

  mutedUsernames.forEach((username) => {
    let checkbox = document.createElement('input')
    checkbox.type = 'checkbox';
    checkbox.name = 'unmute';
    checkbox.value = username;
    checkbox.id = username;

    let checkboxSpan = document.createElement('span');
    checkboxSpan.appendChild(checkbox);
    checkboxSpan.classList.add(USERNAME_CHECK_CLASS);

    let label = document.createElement('label');
    label.setAttribute('for', username);
    label.innerText = username;
    label.classList.add(USERNAME_LABEL_CLASS);

    let container = document.createElement('div');
    container.appendChild(checkboxSpan);
    container.appendChild(label);
    container.classList.add(USERNAME_CLASS);

    usernamesEl.appendChild(container);
  });
}

/**
 * ヘルパー: ストレージからミュート対象ユーザ一覧を取得する
 */
async function loadMutedUsernames() {
  let usernames = await load(KEY);
  return usernames ? usernames : [];
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

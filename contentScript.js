/**
 * 共用の定数
 */
const usernameSelector = '.txtUserName';
const questionSelector = '.C-questionFeedItem';
const key = 'mutedUsernames';

main();

/**
 * メイン関数
 */
async function main() {

  // 質問リストを取得
  // ストレージからミュートユーザリストを取得
  // 該当するユーザ名の質問をリストから削除
  const questionEls = document.querySelectorAll(questionSelector);
  if (questionEls.length < 1) {
    return;
  }

  let mutedUsernames = await load(key);
  if (!mutedUsernames) {
    return;
  }

  let questionElsToMute = [];
  for (let q of questionEls) {
    let usernameContainer = q.querySelector(usernameSelector);
    if (!usernameContainer) {
      continue;
    }

    let linkEl = usernameContainer.getElementsByTagName('a');
    if (!linkEl) {
      continue;
    }

    let username = linkEl[0].getAttribute('title');
    if (mutedUsernames.includes(username)) {
      questionElsToMute.push(q);
    }
  }

  questionElsToMute.forEach(remove);
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

/**
 * ヘルパー: 要素をページから削除
 */
function remove(el) {
  el.parentNode.removeChild(el);
}

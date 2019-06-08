/**
 * 共用の定数
 */
const LIST_SELECTOR = '.j-feedContentsWrapper';
const QUESTION_SELECTOR = '.C-questionFeedItem';
const USERNAME_SELECTOR = '.txtUserName';
const KEY = 'mutedUsernames';

main();

/**
 * メイン関数
 */
async function main() {

  // ページ読み込み時のちらつきを抑えるためあえて "run_at": "document_start" を選んで
  // DOMContentLoaded を使用しています
  window.addEventListener('DOMContentLoaded', init);
}

/**
 * 初期化処理を実行
 */
function init() {
  addObserver();
  applyFilter();
}

/**
 * 質問リストが切り替わったら絞り込みを適用する MutationObserver を追加
 */
function addObserver() {

  // DOM の変更を追いたいので MutationObserver を使う
  let options = { attributes: false, childList: true, subtree: false };
  let targetEls = document.querySelectorAll(LIST_SELECTOR);

  targetEls.forEach((target) => {
    var observer = new MutationObserver(applyFilterOnListLoad);
    observer.observe(target, options);
  });

  /**
   * （質問リストに）小要素が追加されたら applyFilter() を呼んで絞り込みを再適用する
   */
  function applyFilterOnListLoad(mutations, observer) {
    for (let mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        applyFilter();
        break;
      }
    }
  };

}

/**
 * 質問リストに絞り込みを適用
 */
async function applyFilter() {

  // 質問リストを取得
  // ストレージからミュートユーザリストを取得
  // 該当するユーザ名の質問をリストから削除
  let questionEls = document.querySelectorAll(QUESTION_SELECTOR);
  if (questionEls.length < 1) {
    return;
  }

  let mutedUsernames = await load(KEY);
  if (!mutedUsernames) {
    return;
  }

  let questionElsToMute = [];
  for (let q of questionEls) {
    let usernameContainer = q.querySelector(USERNAME_SELECTOR);
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

/**
 * 共用の定数
 */
const KEY = 'mutedUsernames';

main();

/**
 * メイン関数
 */
function main() {

  // ページ読み込み時のちらつきを抑えるためあえて "run_at": "document_start" を選んで
  // DOMContentLoaded を使用しています
  window.addEventListener('DOMContentLoaded', init);
}

/**
 * 初期化処理を実行
 */
function init() {
  initUserPage();
  initQuestionListPage();
}

/**
 * 質問リストページの初期化処理を行う
 */
function initQuestionListPage() {
  addObserver();
  applyFilter();
}

/**
 * プロフィールページの初期化処理を行う
 */
function initUserPage() {
  const USER_PAGE_ID = 'pageID_mypage';
  if (document.body.id !== USER_PAGE_ID) {
    return;
  }

  addMuteSwitch();
}

/**
 * ミュートのトグルスイッチをユーザプロフィールページに追加
 */
function addMuteSwitch() {
  const USER_SUMMARY_ID = 'l-User__summary';
  const USERNAME_SELECTOR = '.ttlMain';

  let summaryEl = document.getElementById(USER_SUMMARY_ID);
  if (!summaryEl) {
    return;
  }

  let username = summaryEl.querySelector(USERNAME_SELECTOR).innerText.trim();

  let link = document.createElement('a');
  link.classList.add('mute-button');
  link.addEventListener('click', toggleMuteState);
  refreshMuteButton();

  let container = document.createElement('div')
  container.appendChild(link);

  summaryEl.appendChild(container);

  /**
   * 最新のミュート状態をトグルスイッチの見栄えに反映
   */
  async function refreshMuteButton() {
    if (await isMuted()) {
      link.classList.add('muted');
      link.innerText = 'unmute';
    } else {
      link.classList.remove('muted');
      link.innerText = 'mute';
    }
  }

  /**
   * トグルスイッチの状態を更新
   */
  async function toggleMuteState(event) {
    let mutedUsernames = await loadMutedUsernames();
    if (await isMuted()) {
      drop(mutedUsernames, username);
    } else {
      mutedUsernames.unshift(username);
    }
    await save(KEY, mutedUsernames);

    refreshMuteButton();
  }

  /**
   * 対象ユーザがミュート状態になっているかどうかをチェック
   */
  async function isMuted() {
    let mutedUsernames = await loadMutedUsernames();
    return mutedUsernames.includes(username);
  }
}

/**
 * 質問リストが切り替わったら絞り込みを適用する MutationObserver を追加
 */
function addObserver() {
  const LIST_SELECTOR = '.j-feedContentsWrapper';

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
  const QUESTION_SELECTOR = '.C-questionFeedItem';
  const USERNAME_SELECTOR = '.txtUserName';

  // 質問リストを取得
  // ストレージからミュートユーザリストを取得
  // 該当するユーザ名の質問をリストから削除
  let questionEls = document.querySelectorAll(QUESTION_SELECTOR);
  if (questionEls.length < 1) {
    return;
  }

  let mutedUsernames = await loadMutedUsernames();

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

  questionElsToMute.forEach(removeFromPage);
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

/**
 * ヘルパー: 要素をページから削除
 */
function removeFromPage(element) {
  element.parentNode.removeChild(element);
}

/**
 * ヘルパー: 配列から特定の要素を除去
 *
 * 引数が変更されるので要注意
 */
function drop(list, element) {
  let index = list.indexOf(element);
  if (index > -1) {
    list.splice(index, 1);
  }
}

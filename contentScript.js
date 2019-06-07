/**
 * 共用の定数
 */
const usernameSelector = '.txtUserName';
const questionSelector = '.C-questionFeedItem';
const mutedUsername = 'FBI';

main();

/**
 * メイン関数
 */
function main() {

  // 質問リストを取得
  // 該当するユーザ名のものをリストから削除
  const questionEls = document.querySelectorAll(questionSelector);

  if (questionEls.length < 1) {
    return;
  }

  var questionElsToMute = [];
  for (let q of questionEls) {
    let usernameContainer = q.querySelector(usernameSelector);
    if (!usernameContainer) {
      continue;
    }

    let username = usernameContainer.innerText;
    if (username.includes(mutedUsername)) {
      questionElsToMute.push(q);
    }
  }

  questionElsToMute.forEach(remove);
}

/**
 * ヘルパー: 要素をページから削除
 */
function remove(el) {
  el.parentNode.removeChild(el);
}

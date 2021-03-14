/**
 * ** 概要 **
 * リンクを自動更新するスクリプトです
 * https://twitter.com/peprintenpa/status/1361132929678667787 を参照しました
 *
 * ** 動作 **
 * 1. リンクが変更されたことを検知します
 * 2. ダイアログを出して，リンクを更新するか確認します
 * 3. ダイアログでの許可があれば更新します
 * 4. ダイアログのチェックボックスをチェックすると，以降は2を省略します
 */

// @target 'indesign'
// @targetengine 'updateLinks'

/**
 * 「再表示しない」ボックスがついた確認ダイアログのクラス
 */
var Confirmer = (function () {
  /**
   * コンストラクタ
   * @param {string} [title="重要な確認事項があります"] （省略可）ダイアログのタイトル
   * @param {string} [yesBtnTxt="はい"] （省略可）承諾ボタンのテキスト
   * @param {string} [noBtnTxt="いいえ"] （省略可）拒否ボタンのテキスト
   */
  var Confirmer = function (title, yesBtnTxt, noBtnTxt) {
    // newをつけ忘れた場合に備えて
    if (!(this instanceof Confirmer)) {
      return new Confirmer();
    }
    this.shouldConfirm = true; // 確認ダイアログを表示するかどうか
    this.result = false; // 確認の結果

    // デフォルト引数
    if (title === undefined) title = '重要な確認事項があります';
    if (yesBtnTxt === undefined) yesBtnTxt = 'はい';
    if (noBtnTxt === undefined) noBtnTxt = 'いいえ';

    this.title = title;
    this.yesBtnTxt = yesBtnTxt;
    this.noBtnTxt = noBtnTxt;
  };

  /**
   * 確認の結果を返す。必要に応じて確認ダイアログを表示する
   * @param {string} body ダイアログの本文
   * @returns {boolean} 確認の結果
   */
  Confirmer.prototype.confirmIfNeed = function (body) {
    if (this.shouldConfirm) {
      var dlg = new Window('dialog', this.title);
      dlg.add('statictext', undefined, body, { multiline: true });

      var btnGrp = dlg.add('group');
      var yesBtn = btnGrp.add('button', undefined, this.yesBtnTxt);
      yesBtn.onClick = function () {
        dlg.close(1); // dlg.show()の返り値が1になる
      };
      var noBtn = btnGrp.add('button', undefined, this.noBtnTxt);
      noBtn.onClick = function () {
        dlg.close(0); // dlg.show()の返り値が0になる
      };

      var checkbox = dlg.add(
        'checkbox',
        undefined,
        'このダイアログを再表示しない'
      );
      checkbox.value = false; // チェックボックスのデフォルトの値

      var result = dlg.show();
      if (result === 2) return false; // ダイアログが閉じられた場合の処理
      this.result = result;
      this.shouldConfirm = !checkbox.value;
    }
    return this.result;
  };

  return Confirmer;
})();

if (app.eventListeners.itemByName('updateLinks') !== null) {
  app.eventListeners.itemByName('updateLinks').remove();
}

var tgtLink; // BridgeTalkから実行できるようにグローバル変数として定義
var linkConfirmer = new Confirmer(
  '未更新のリンクがあります',
  '更新する',
  '更新しない'
);
var listener = app.addEventListener('afterAttributeChanged', function (ev) {
  if (
    ev.target.reflect.name === 'Link' &&
    ev.target.status === LinkStatus.LINK_OUT_OF_DATE
  ) {
    tgtLink = ev.target;
    var shouldUpdate = linkConfirmer.confirmIfNeed(
      'リンク「' + tgtLink.name + '」が変更されています。更新しますか？'
    );
    // afterAttributeChangedイベントリスナー内からev.target.update()ができないので
    // リスナー外のBridgeTalkから実行する
    if (shouldUpdate) executeByBridgetalk('tgtLink.update();');
  }
});
listener.name = 'updateLinks';

/**
 * BridgeTalkからこの名前空間にスクリプトを実行する
 * @param {string} script 実行するスクリプト
 */
function executeByBridgetalk(script) {
  var bt = new BridgeTalk();
  bt.target = BridgeTalk.appSpecifier + '#updateLinks';
  bt.body = script;
  bt.send();
}

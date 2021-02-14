/**
 * ** 概要 **
 * リンクを自動更新するスクリプトです
 *
 * ** 動作 **
 * 1. リンクが変更されたことを検知します
 * 2. ダイアログを出して，リンクを更新するか確認します
 * 3. ダイアログでの許可があれば更新します
 * 4. ダイアログのチェックボックスをチェックすると，以降は2を省略します
 *
 * ** 注意 **
 * リンクを更新しなかった場合，同じリンクに対してダイアログが複数回出ます
 */

// @target 'indesign'
// @targetengine 'updateLinks'

if (app.eventListeners.itemByName('updateLinks') !== null) {
  app.eventListeners.itemByName('updateLinks').remove();
}

var shouldConfirm = true; // 確認ダイアログを出すかどうか
var shouldUpdate = false; // リンクを更新するかどうか
var listener = app.addEventListener('afterLinksChanged', function (ev) {
  var linkList = ev.target.links;
  var lenLink = linkList.length;
  for (var i = lenLink - 1; i >= 0; i--) {
    var currentLink = linkList[i];
    if (currentLink.status === LinkStatus.LINK_OUT_OF_DATE) {
      if (shouldConfirm) {
        var flags = myConfirm(
          '未更新リンクの更新',
          currentLink.name + 'が変更されています。更新しますか？',
          '更新する',
          '更新しない',
          'このダイアログを再度表示しない'
        );
        // ダイアログが閉じられた場合はflags===nullになる
        if (flags) {
          if (flags[0]) {
            currentLink.update();
          }
          if (flags[1]) {
            shouldConfirm = false;
            shouldUpdate = flags[0];
          }
        }
      } else {
        if (shouldUpdate) {
          currentLink.update();
        }
      }
    }
  }
});
listener.name = 'updateLinks';

/**
 * 「再度表示しない」ボックス付きのconfirmダイアログ
 * @param {string} title
 * @param {string} staticTxt
 * @param {string} yesBtnTxt
 * @param {string} noBtnTxt
 * @param {string} checkboxTxt
 * @returns {Array<boolean>} [result, checkbox.value]
 */
function myConfirm(title, staticTxt, yesBtnTxt, noBtnTxt, checkboxTxt) {
  var dlg = new Window('dialog', title);
  dlg.add('statictext', undefined, staticTxt, { multiline: true });

  var btnGrp = dlg.add('group');
  var yesBtn = btnGrp.add('button', undefined, yesBtnTxt);
  yesBtn.onClick = function () {
    dlg.close(1);
  };
  var noBtn = btnGrp.add('button', undefined, noBtnTxt);
  noBtn.onClick = function () {
    dlg.close(0);
  };

  var checkbox = dlg.add('checkbox', undefined, checkboxTxt);
  checkbox.value = false; // チェックボックスのデフォルトの値

  var result = dlg.show();
  if (result === 2) return null; // ダイアログが閉じられた場合
  return [result, checkbox.value];
}

/**
 * ** 概要 **
 * Illustratorの「その他のスクリプト」をInDesignのスクリプトパネルで簡易実装
 * https://blue-screeeeeeen.net/indesign/20170913.html より
 */

// @target 'indesign'

(function () {
  var targetFile = File.openDialog(
    '実行するスクリプトを指定してください',
    'Javascript files:*.js;*.jsx'
  );
  if (targetFile) {
    $.evalFile(decodeURI(targetFile));
  }
})();

// ==UserScript==
// @name        Bangumi BBCode Preview
// @namespace   wullic
// @author      Wullic
// @version     0.1
// @description Bangumi BBCode Preview, 在Textarea编辑器里提供预览选项
// @include     /^https?://(bangumi\.tv|bgm\.tv)/?.*/
// @icon        https://bgm.tv/img/favicon.ico
// @grant       GM_info
// @run-at      document.idle
// ==/UserScript==

import { previewRun } from "#/modules/editor/bbcode-preview";

setTimeout(previewRun, 500);

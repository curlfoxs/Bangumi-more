// ==UserScript==
// @name        Bangumi 全条目 + 全章节中文化
// @namespace   wullic
// @author      Wullic
// @version     0.2
// @description Bangumi 全条目 + 全章节中文化
// @include     /^https?://(bangumi\.tv|bgm\.tv)/?.*/
// @icon        https://bgm.tv/img/favicon.ico
// @grant       GM_info
// @run-at      document.idle
// ==/UserScript==

import { previewRun } from "#/modules/editor/bbcode-preview";

setTimeout(previewRun, 500);

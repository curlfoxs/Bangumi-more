// ==UserScript==
// @name        Bangumi 全条目 + 全章节中文化
// @namespace   wullic
// @author      Wullic
// @version     0.2
// @description Bangumi 全条目 + 全章节中文化
// @include     /^https?://(bangumi\.tv|bgm\.tv)/?.*/
// @icon        https://bgm.tv/img/favicon.ico
// @grant       GM_info
// @run-at      document.start
// ==/UserScript==

import { transform, MarkLang } from "./outlined";

function previewRun () {
    let preview = false;
    const mkHeader = document.querySelector(".markItUpHeader") as HTMLElement;
    const mkTextarea = document.querySelector("textarea[name='content']") as HTMLTextAreaElement;
    if (mkHeader && mkTextarea) {
        const s = document.createElement("li");
        const a = document.createElement("a");
        const previewBtn = document.createElement("li");
        const div = document.createElement("div");
        div.setAttribute("type", "hidden");

        s.setAttribute("class", "markItUpSeparator");
        s.textContent = "---------------";
        a.href = "";
        a.textContent = "预览";
        previewBtn.append(a);
        mkHeader.append(s, previewBtn);
        div.setAttribute("type", "hidden");
        mkTextarea.after(div);

        previewBtn.addEventListener("click", evt => {
            if (preview == false) {
                mkTextarea.setAttribute("type", "hidden");
                const src = mkTextarea.value;
                const dest = transform(src, MarkLang.BB, MarkLang.HTML);
                if (dest) {
                    div.innerHTML = dest.trim();
                }
                div.removeAttribute("type");
                preview = true;
            } else {
                div.setAttribute("type", "hidden");
                mkTextarea.removeAttribute("type");
                preview = false;
            }
        });
    }
}

window.addEventListener("DOMContentLoaded", previewRun);

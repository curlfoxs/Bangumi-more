"use strict";
// ==UserScript==
// @name        前置已启用的超合金组件
// @namespace   wullic
// @author      Wullic
// @version     0.1
// @description 前置已启用的超合金组件
// @include    /^https?://(bangumi\.tv|bgm\.tv)/settings/gadgets/
// @icon        https://bgm.tv/img/favicon.ico
// @run-at      document-idle
// ==/UserScript==
function main () {
    const h2 = document.querySelectorAll("#timeline > h2[class='subtitle']");
    const h2Enabled = document.createElement("h2");
    h2Enabled.setAttribute("class", "subtitle");
    h2Enabled.innerText = "已启用组件";
    const ulEnabled = document.createElement("ul");
    // enbaled_h2.after(ulEnabled);
    for (let i = 0; i < h2.length; ++i) {
        if (h2[i].innerText == "全部组件") {
            const ulGadgets = h2[i].nextElementSibling;
            const gadgets = ulGadgets.children;
            h2[i].before(h2Enabled);
            for (let j = 0; j < gadgets.length;) {
                const span = gadgets[j].querySelector("span.info.clearit > a > span");
                if (span && span.innerText == "停用") {
                    ulEnabled.appendChild(gadgets[j]);
                } else {
                    ++j;
                }
            }
            h2[i].before(ulEnabled);
        }
    }
}
main();
// # sourceMappingURL=Bangumi-gadgets-already-enabled.user.js.map

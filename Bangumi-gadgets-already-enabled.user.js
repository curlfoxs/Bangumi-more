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


function main() {
  var h2 = document.querySelectorAll("#timeline > h2[class='subtitle']");

  var enabled_h2 = document.createElement("h2");
  enabled_h2.setAttribute("class", "subtitle");
  enabled_h2.innerText = "已启用组件";

  var enabled_ul = document.createElement("ul");
  // enbaled_h2.after(enabled_ul);

  for (let i=0; i<h2.length; ++i) {
    if (h2[i].innerText == "全部组件"){
      var gadgets_ul = h2[i].nextElementSibling;
      var gadgets = gadgets_ul.children;
      h2[i].before(enabled_h2);
      for (let j=0; j<gadgets.length;) {
	let span = gadgets[j].querySelector("span.info.clearit > a > span");
	if (span && span.innerText == "停用") {
	  enabled_ul.appendChild(gadgets[j]);
	}
	else {
	  ++j;
	}
      }
      h2[i].before(enabled_ul);
    }
  }
}

main();

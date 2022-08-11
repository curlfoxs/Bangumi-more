// ==UserScript==
// @name        Bangumi 全条目中文化
// @namespace   wullic
// @author      Wullic
// @version     0.1
// @description Bangumi 全条目(Subjects)中文化
// @include     /^https?://(bangumi\.tv|bgm\.tv)/?.*/
// @icon        https://bgm.tv/img/favicon.ico
// @run-at      document.start
// ==/UserScript==

const_version = "0.1";


function ajaxRequest(/*method, url, headers*/ ) {
  let method = arguments[0];
  let url = arguments[1];
  if (arguments.length > 2) {
    var headers = arguments[2];
  }

  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest;
    xhr.open(method, url);
    for (let name in headers) {
      xhr.setRequestHeader(name, headers[name]);
    }
    xhr.onload = function() {
      if (this.status == 200) {
	resolve(this.response);
      }
      else {
	reject({
	  status: this.status,
	  statusText: this.statusText
	});
      }
    };
    xhr.onerror = function(e) {
      reject({
	status: this.status,
	statusText: this.statusText
      });
    };
    xhr.send();
  });
}

class SubjectItem {
  id;
  name;
  alias = "subject"
  getApi = "https://api.bgm.tv/v0/subjects/";

  constructor(id) {
    this.id = id;
  }

  get key() {
    return `${this.alias}/${this.id}`
  }

  async getName() {
    await this.updateData();
    return this.name;
  }

  async updateData() {
    if (!await this.fetchItem()) {
      if(await this.fetchNetData())
	await this.writeItem();
    }
  }

  async fetchItem() {
    this.name = window.localStorage.getItem(this.key);
    return this.name;
  }

  async writeItem() {
    window.localStorage.setItem(this.key, this.name);
  }

  async deleteItem() {
    window.localStorage.removeItem(this.key);
  }

  async fetchNetData() {
    let url = this.getApi + this.id;
    let data = await ajaxRequest("GET", url, {"accept": "application/json"});
    data = JSON.parse(data);
    this.name = data['name_cn'];
    return this.name;
  }
}

class SubjectBoss {
  idRegEx = /(?<!topic)\/subject\/(\d+)$/i;
  config_lang = "default";

  constructor() {
    this.staff = SubjectItem;
  }

  updateEleName(element, newName) {
    if (!element || !newName) return null;
    /* Case1 : <div id="subject_inner_info" ...> <a href="subject/xxxx"> <imag>NAME</a></div> */
    /* Case2 : <a href="subject/xxxx" ...>NAME</a> */

    /* Case3 : <a href="subject/xxx"> <small> [1/9] </small> <span>NAME</span></a> */
    let childs = element.children;
    let len = childs.length;
    if (len <= 0) {
      element.innerText = newName; // Case2
    }
    else if (len == 1 && childs[0].tagName.toLowerCase() == "img") { // Case1
      element.innerHTML = childs[0].outerHTML + newName;
    }
    else { // Case 3
      for (let i=0; i<len; ++i) {
	if (childs[i].tagName.toLowerCase() == "span") {
	  let cls = childs[i].getAttribute("class");
	  if (cls) {
	    if (cls == "name") childs[i].innerText = newName;
	  }
	  else {
	    childs[i].innerText = newName;
	  }
	}
      }
    }
  }

  currentEleName(element) {
    if (!element) return null;
    let childs = element.children;
    if (!childs.length) return element.innerText;
    for (let i=0; i<childs.length; ++i) {
      if (childs[i].tagName.toLowerCase() == "span") {
	let cls = childs[i].getAttribute("class");
	if (cls) {
	  if (cls == "name") return childs[i].innerText;
	}
	else {
	  return childs[i].innerText;
	}
      }
    }
  }

  needUpdateName(element) {
    let curName = this.currentEleName(element);
    if (!curName) return false; // Invalid
    curName = curName.replaceAll(/\s/g, '');
    let re = /[^0-9\u4e00-\u9fa5]/;
    if (re.test(curName)) {// not all chinese
      // console.log(`不全为中文：${curName}`);
      return true;
    }
    else{// all Chinese
      // console.log(`全为中文：${curName}`);
	    return false;
    }

  }

  updateAllName() {
    if (this.config_lang == "default") return;
    document.querySelectorAll("a[href]").forEach((ele) => {
      let href = ele.getAttribute("href");
      let match = href.match(this.idRegEx);
      if (match && this.needUpdateName(ele)) {
	let item = new this.staff(match[1]);
	item.getName().then(newName => {
	  this.updateEleName(ele, newName);
	}).catch(e => {
	  console.log(e);
	});
      }
    });
  }

  createSwitcher() {
    let logout = document.querySelector("#dock a[href*='/logout/']");
    if (logout) {
      let switcher = document.createElement("a");
      switcher.href = '#';
      let lang = this.config_lang;
      switcher.textContent = lang == "default" ? "默认" : "汉化";
      switcher.addEventListener("click", evt => {
	lang = this.config_lang == "default" ? "cn" : "default";
	location.href = location.href;
	window.localStorage.setItem("config_lang", lang);
      });
      logout.before(switcher, " | ");
    }
  }

  updateName() {
    this.createSwitcher();
    this.updateAllName();

    /* Detect change on DOM nodes */
    // @see https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
    // @see https://bangumi.tv/dev/app/258
    var tmlContent = document.querySelector("#tmlContent");
    if (tmlContent) {
      let observer = new MutationObserver(() => {
	this.updateAllName();
      });
      observer.observe(tmlContent, {
	childList: true,
      });
    }
  }
}

function main () {
  var curVersion = const_version;
  var usedVersion = window.localStorage.getItem("used_version");
  if (usedVersion != curVersion) {
    window.localStorage.clear();
    window.localStorage.setItem("used_version", curVersion);
  }

  var subj = new SubjectBoss();
  subj.config_lang = window.localStorage.getItem("config_lang");
  subj.updateName();
}

/* Detect document loaded state => document.readyState */
// @see https://stackoverflow.com/questions/978740/javascript-how-to-detect-if-document-has-loaded-ie-7-firefox-3

// @see https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
// State: "loading" "interactive" "complete"
if (document.readyState == "interactive" || document.readyState == "complete") {
  main();
}
else {
  window.addEventListener("DOMContentLoaded", main);
}

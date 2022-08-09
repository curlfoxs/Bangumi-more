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


// AjaxRequest
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

const const_subject_alias = "subject";
const const_subject_getApi = "https://api.bgm.tv/v0/subjects/";
const const_subject_idRegex = /.*subject\/(\d+)$/i;

const const_ep_alias = "ep";
const const_ep_getApi = "https://api.bgm.tv/v0/episodes/";
const const_ep_idRegex = /.*ep\/(\d+)$/i;

var config_lang;

class Item {
  constructor(id) {
    this.id = id;
    this.info ={};
  }

  get alias() {
    return; /* Need impletation */
  }

  get getApi () {
    return; /* Need impletation */
  }

  get key() {
    return `${this.alias}/${this.id}`;
  }

 async fetchNetData() {
    return; /* Need Implementation */
  }

  async getInfo() {
    await this.updateData();
    return this.info;
  }

  async updateData() {
    if (!await this.fetchItem()) {
      await this.fetchNetData();
      await this.writeItem();
    }
  }

  async fetchItem() {
    let rel = window.localStorage.getItem(this.key);
    if (rel){
      this.info = JSON.parse(rel);
      return true; // Succeed
    }
    return false; // Failed
  }

  async writeItem() {
    if (Object.keys(this.info).length > 0)
      window.localStorage.setItem(this.key, JSON.stringify(this.info));
  }

   async deleteItem() {
    window.localStorage.removeItem(this.key);
  }
}

class SubjectItem extends Item {
  get alias() {
    return const_subject_alias ; /* Need impletation */
  }

  get getApi () {
    return const_subject_getApi; /* Need impletation */
  }

  async fetchNetData() {
    let url = this.getApi + this.id;
    let data = await ajaxRequest("GET", url, {"accept": "application/json"});
    data = JSON.parse(data);
    if (data['name_cn']) { // Detect data whether have key "name_cn" : true or false
      this.info.name_cn = data.name_cn;
    }
  }
}

class EpisodeItem extends Item {
  get alias() {
    return const_ep_alias ; /* Need implementation */
  }

  get getApi () {
    return const_ep_getApi; /* Need implementation */
  }

  async fetchNetData() {
    let url = this.getApi + this.id;
    let data = await ajaxRequest("GET", url, {"accept": "application/json"});
    data = JSON.parse(data);
    if (data['name_cn']) {// Detect data whether have key "name_cn" : true or false
      this.info.name_cn = data.name_cn;
    }
    if (data['ep']) {// Detect data whether have key "name_cn" : true or false
      this.info.ep = data.ep;
    }
  }

}

class Boss {

  get idRegex() {
    return; /* Need Implementation */
  }

  get staff() {
    return; /* Need Implementation */
  }

  updateEleName(element, info) {
    return; /* Need Implementation */
  }

  currentEleName(element) {
    return; /* Need Implementation */
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
    if (config_lang == "default") return;
    document.querySelectorAll("a[href]").forEach((ele) => {
      let href = ele.getAttribute("href");
      let match = href.match(this.idRegex);
      if (match && this.needUpdateName(ele)) {
	let item = new this.staff(match[1]);
	item.getInfo().then(info => {
	  this.updateEleName(ele, info);
	}).catch(e => {
	  console.log(e);
	});
      }
    });
  }

  createSwitcher() {
    let rel = document.querySelector('#wullic_chinese');
    if (rel) return;
    let logout = document.querySelector("#dock a[href*='/logout/']");
    if (logout) {
      let switcher = document.createElement("a");
      switcher.id = "wullic_chinese";
      switcher.href = '#'; // Set element url
      let lang = config_lang;
      switcher.textContent = lang == "default" ? "默认" : "汉化";
      switcher.addEventListener("click", evt => {
	lang = config_lang == "default" ? "cn" : "default";
	location.href = location.href; // Set url = current page url, to refresh page
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

class SubjectBoss extends Boss {

  get idRegex() {
    return const_subject_idRegex;
  }

  get staff() {
    return SubjectItem;
  }

  updateEleName(element, info) {
    if (!element || !info || !info['name_cn']) return null;
    /* Case1 : <a href="subject/xxxx" ...>NAME</a> */
    /* Case2 : <div id="subject_inner_info" ...> <a href="subject/xxxx"> <imag>NAME</a></div> */
    /* Case3 : <a href="subject/xxx"> <small> [1/9] </small> <span>NAME</span></a> */
    let childs = element.children;
    let len = childs.length;
    if (len <= 0) {
      element.innerText = info.name_cn; // Case1
    }
    else if (len == 1 && childs[0].tagName.toLowerCase() == "img") { // Case2
      element.innerHTML = childs[0].outerHTML + info.name_cn;
    }
    else { // Case 3
      for (let i=0; i<len; ++i) {
	if (childs[i].tagName.toLowerCase() == "span") {
	  let cls = childs[i].getAttribute("class");
	  if (cls) {
	    if (cls == "name") childs[i].innerText = info.name_cn;
	  }
	  else {
	    childs[i].innerText = info.name_cn;
	  }
	}
      }
    }
  }

  currentEleName(element) {
    /* Case1 : <a href="subject/xxxx" ...>NAME</a> */
    /* Case2 : <div id="subject_inner_info" ...> <a href="subject/xxxx"> <imag>NAME</a></div> */
    /* Case3 : <a href="subject/xxx"> <small> [1/9] </small> <span>NAME</span></a> */

    if (!element) return null;
    let childs = element.children;
    if (!childs.length) return element.innerText; // Case1
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


}

class EpisodeBoss extends Boss {

  get idRegex() {
    return const_ep_idRegex;
  }

  get staff() {
    return EpisodeItem;
  }

  updateEleName(element, info) {
    if (!element || !info || !info['name_cn']) return null;
    /* Case1 : <a>NAME</a> */
    /* Case2 : <a><small></small>NAME</a> */
    /* Case3 : <small><a>NAME</a></small> */
    /* Case4 : "上一章节prev" 和 "下一章节next" */
    let childs = element.children;
    let parent = element.parentNode;
    const EPNAME = `「ep. ${info.ep}」 ${info.name_cn}`;

    if (childs.length <= 0) { // Case1 && Case3
      let cls = element.getAttribute("class");
      if (cls != "prev" && cls != "next"){ // Ignore Case4
	element.innerText = (parent.tagName.toLowerCase() == "small") ? info.name_cn : EPNAME;
      }
    }
    else if (childs.length == 1) { // Case2
      element.innerHTML = childs[0].outerHTML + ' ' + info.name_cn;
    }
    else {
      element.innerText = info.name_cn;
    }
  }

  currentEleName(element) {
    /* Case1 : <a href="subject/xxxx" ...>NAME</a> */
    /* Case2 : <a href="subject/xxxx" ...><small></small>NAME</a> */
    if (!element) return null;
    return element.innerText;
  }
}

function main () {
  config_lang = window.localStorage.getItem("config_lang");
  var subjectBoss = new SubjectBoss();
  var epBoss = new EpisodeBoss();
  subjectBoss.updateName();
  epBoss.updateName();
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


// Most debug time cost on spelling error, indicating that the significance of TypeScript and ESlint!

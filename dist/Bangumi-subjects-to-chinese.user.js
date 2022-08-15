"use strict";
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
// How to use Record<T, T> type
// @see https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkt
function ajaxRequest (method, url, headers) {
    /**
     * Make a async ajax request
     *
     * @param method String of http request method, "GET" or "POST"
     * @param url String of request object's path
     * @param headers Dictionary of http request headers
     * @return Promise
     */
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        for (const name in headers) {
            xhr.setRequestHeader(name, headers[name]);
        }
        xhr.onload = function () {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                reject(new Error(`${this.status}: ${this.statusText}`));
            }
        };
        xhr.onerror = function (evt) {
            reject(new Error(`${this.status}: ${this.statusText}`));
        };
        xhr.send();
    });
}
/* Configs */
const constVersion = "0.2";
let configLang;
const subjectOptions = {
    category: "subjects",
    getApi: "https://api.bgm.tv/v0/subjects/",
    // 需要过滤掉: <a href="/rakuen/topic/subject/22505" class="title avatar l" target="right">莉可丽丝的讨论</a>
    // 需要过滤掉: <a href="/rakuen/topic/subject/19876" class="title avatar l" target="right">CLANNED的讨论</a>
    idRegex: /(?<!topic)\/subject\/(\d+)$/i
};
const epOptions = {
    category: "ep",
    getApi: "https://api.bgm.tv/v0/episodes/",
    idRegex: /.*ep\/(\d+)$/i
};
// Modifiers: public, private, protected
// @see https://www.typescriptlang.org/docs/handbook/classes.html
// Keyword: abstract
class ItemModel {
    constructor (id) {
        this.id = id;
        this.info = {};
    }

    get uniqueKey () {
        return `${this.options.category}/${this.id}`;
    }

    async getInfo () {
        await this.updateData();
        return this.info;
    }

    async updateData () {
        if (!this.fetch()) {
            await this.fetchNet();
            this.store();
        }
    }

    fetch () {
        const rel = window.localStorage.getItem(this.uniqueKey);
        if (rel) {
            this.info = JSON.parse(rel);
            return true; // Succeed
        }
        return false; // Failed
    }

    store () {
        if (Object.keys(this.info).length > 0) {
            // Handle storage exceed error
            // @see https://chrisberkhout.com/blog/localstorage-errors/
            try {
                window.localStorage.setItem(this.uniqueKey, JSON.stringify(this.info));
            } catch (e) {
                alert("localStorage is full. Maybe delete a few items?");
            }
        }
    }

    del () {
        window.localStorage.removeItem(this.uniqueKey);
    }
}
class SubjectItem extends ItemModel {
    get options () {
        return subjectOptions;
    }

    async fetchNet () {
        const url = this.options.getApi + this.id;
        const data = JSON.parse(await ajaxRequest("GET", url, { accept: "application/json" }));
        if (data.name_cn) { // Detect data whether have key "name_cn" : true or false
            this.info.name_cn = data.name_cn;
        }
    }
}
class EpisodeItem extends ItemModel {
    get options () {
        return epOptions;
    }

    async fetchNet () {
        const url = this.options.getApi + this.id;
        const data = JSON.parse(await ajaxRequest("GET", url, { accept: "application/json" }));
        if (data.name_cn) { // Detect data whether have key "name_cn" : true or false
            this.info.name_cn = data.name_cn;
        }
        if (data.ep || data.ep == 0) { // Detect data whether have key "name_cn" : true or false
            this.info.ep = data.ep;
        }
    }
}
class Controler {
    needUpdateName (ele) {
        const name = this.currentEleName(ele);
        if (!name) {
            return false;
        } else {
            const re = /[^0-9\u4e00-\u9fa5]/;
            // Fix - Property 'replaceAll' does not exist on type 'String'
            // @see https://bobbyhadz.com/blog/typescript-property-replaceall-does-not-exist-on-type-string
            const rel = re.test(name.replaceAll(/\s/g, ""));
            return rel ? true : false;
        }
    }

    updateAllName () {
        if (configLang == "default") { return; } // 「默认」语言 直接返回
        const re = /\/subject\/\\d+\/ep/i;
        if (location.pathname.match(re)) { return; } // 「章节列表」页面不汉化
        // Default querySelectorAll(): NodeList<Element>
        document.querySelectorAll("a[href]").forEach(ele => {
            // Property 'href' does not exist on type "Element"
            // @see https://bobbyhadz.com/blog/typescript-property-href-not-exist-type-htmlelement
            const match = ele.href.match(this.options.idRegex);
            if (match && this.needUpdateName(ele)) {
                const item = new this.Model(match[1]);
                item.getInfo().then(info => {
                    this.updateEleName(ele, info);
                }).catch((e) => {
                    console.log(e);
                });
            }
        });
    }

    createSwitcher () {
        if (document.querySelector("#wullic_chinese")) { return; }
        const logout = document.querySelector("#dock a[href*='/logout/']");
        if (logout) {
            const switcher = document.createElement("a");
            switcher.id = "wullic_chinese";
            switcher.href = "#"; // Set element url
            let lang = configLang;
            switcher.textContent = lang == "default" ? "默认" : "汉化";
            switcher.addEventListener("click", evt => {
                lang = configLang == "default" ? "cn" : "default";
                window.localStorage.setItem("configLang", lang);
                location.href = location.href; // Set url = current page url, to refresh page
            });
            logout.before(switcher, " | ");
        }
    }

    updateName () {
        this.createSwitcher();
        this.updateAllName();
        /* Detect change on DOM nodes */
        // @see https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
        // @see https://bangumi.tv/dev/app/258
        const tmlContent = document.querySelector("#tmlContent");
        if (tmlContent) {
            const observer = new MutationObserver(() => {
                this.updateAllName();
            });
            observer.observe(tmlContent, {
                childList: true
            });
        }
    }
}
class SubjectControler extends Controler {
    get Model () {
        return SubjectItem;
    }

    get options () {
        return subjectOptions;
    }

    updateEleName (element, info) {
        if (!element || !info || !info.name_cn) { return; }
        /* Case1 : <a href="subject/xxxx" ...>NAME</a> */
        /* Case2 : <div id="subject_inner_info" ...> <a href="subject/xxxx"> <imag>NAME</a></div> */
        /* Case3 : <a href="subject/xxx"> <small> [1/9] </small> <span>NAME</span></a> */
        const childs = element.children;
        const len = childs.length;
        if (len <= 0) {
            element.innerText = info.name_cn; // Case1
        } else if (len == 1 && childs[0].tagName.toLowerCase() == "img") { // Case2
            element.innerHTML = childs[0].outerHTML + info.name_cn;
        } else { // Case 3
            for (let i = 0; i < len; ++i) {
                if (childs[i].tagName.toLowerCase() == "span") {
                    const cls = childs[i].getAttribute("class");
                    if (cls) {
                        if (cls == "name") { childs[i].innerText = info.name_cn; }
                    } else {
                        childs[i].innerText = info.name_cn;
                    }
                }
            }
        }
    }

    currentEleName (element) {
        /* Case1 : <a href="subject/xxxx" ...>NAME</a> */
        /* Case2 : <div id="subject_inner_info" ...> <a href="subject/xxxx"> <imag>NAME</a></div> */
        /* Case3 : <a href="subject/xxx"> <small> [1/9] </small> <span>NAME</span></a> */
        if (!element) { return; }
        // childNodes 和 children 的 不同： children 只返回HTML结点
        // childNodes会返回HTML元素节点，属性节点，文本节点
        const childs = element.children;
        if (!childs.length) { return element.innerText; } // Case1
        // Array.from(childs).forEach((child) => {})
        for (let i = 0; i < childs.length; ++i) {
            if (childs[i].tagName.toLowerCase() == "span") {
                const cls = childs[i].getAttribute("class");
                if (cls) {
                    if (cls == "name") { return childs[i].innerText; }
                } else {
                    return childs[i].innerText;
                }
            }
        }
    }
}
class EpisodeControler extends Controler {
    get Model () {
        return EpisodeItem;
    }

    get options () {
        return epOptions;
    }

    updateEleName (element, info) {
        if (!element || !info || !info.name_cn) { return; }
        /* Case1 : <a>NAME</a> */
        /* Case2 : <a><small></small>NAME</a> */
        /* Case3 : <small><a>NAME</a></small> */
        /* Case4 : "上一章节prev" 和 "下一章节next" */
        const childs = element.children;
        const parent = element.parentNode;
        const EPNAME = `「ep. ${info.ep}」 ${info.name_cn}`;
        if (childs.length <= 0) { // Case1 && Case3
            const cls = element.getAttribute("class");
            if (cls != "prev" && cls != "next") { // Ignore Case4
                element.innerText = (parent.tagName.toLowerCase() == "small") ? info.name_cn : EPNAME;
            }
        } else if (childs.length == 1) { // Case2
            element.innerHTML = `${childs[0].outerHTML} ${info.name_cn}`;
        } else {
            element.innerText = info.name_cn;
        }
    }

    currentEleName (element) {
        /* Case1 : <a href="subject/xxxx" ...>NAME</a> */
        /* Case2 : <a href="subject/xxxx" ...><small></small>NAME</a> */
        if (!element) { return; }
        return element.innerText;
    }
}
function run () {
    // Greasemonkey script version
    // @see https://stackoverflow.com/questions/9237228/greasemonkey-script-version-constant
    const usedVersion = window.localStorage.getItem("used_version");
    if (usedVersion != constVersion) {
        window.localStorage.clear();
        window.localStorage.setItem("used_version", constVersion);
    }
    configLang = window.localStorage.getItem("configLang");
    const subjectControler = new SubjectControler();
    const epControler = new EpisodeControler();
    subjectControler.updateName();
    epControler.updateName();
}
/* Detect document loaded state => document.readyState */
// @see https://stackoverflow.com/questions/978740/javascript-how-to-detect-if-document-has-loaded-ie-7-firefox-3
// @see https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
// State: "loading" "interactive" "complete"
if (document.readyState == "interactive" || document.readyState == "complete") {
    run();
} else {
    window.addEventListener("DOMContentLoaded", run);
}
// Most debug time cost on spelling error, indicating that the significance of TypeScript and ESlint!
// !Accessors are only available when targeting ECMAScript 5 and higher.
// @see https://stackoverflow.com/questions/41010780/accessors-are-only-available-when-targeting-ecmascript-5-and-higher
// @see https://stackoverflow.com/questions/41336301/typescript-cannot-find-name-window-or-document
// How to complie, and which config to use
// @see https://stackoverflow.com/questions/51024947/typescript-error-error-ts2705-an-async-function-or-method-in-es5-es3-requires
// # sourceMappingURL=Bangumi-subjects-to-chinese.user.js.map

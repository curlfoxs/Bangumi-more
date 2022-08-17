import { text } from "stream/consumers";
import { transform, MarkLang } from "./outlined";

const EDITTOOL_INIT_DELAY = 300;

function previewRun () {
    const l = document.querySelector("#comment_list");
    l?.addEventListener("click", function fn (evt: Event) {
        const textarea = (evt.currentTarget as HTMLElement).querySelector("textarea.sub_reply");
        if (textarea && textarea == evt.target && textarea.nextElementSibling.hasAttribute("class")) { // Check exist and no preivew-html div (created by us with no "class" attribute)
            setTimeout(addPreview, EDITTOOL_INIT_DELAY, textarea);
        }
    });

    const selectors = ["textarea#content", "textarea#tpc_content", "textarea#comment", "textarea#newbio", "textarea#msg_body", "textarea#summary"];
    selectors.forEach((s: string) => {
        const mkTextarea = document.querySelector(s) as HTMLTextAreaElement;
        if (mkTextarea) {
            mkTextarea.addEventListener("focus", function fn () {
                setTimeout(addPreview, EDITTOOL_INIT_DELAY, mkTextarea);
                mkTextarea.removeEventListener("focus", fn);
            });
        }
    });

    function addPreview (textarea: HTMLTextAreaElement) {
        const mkHeader = textarea.previousElementSibling as HTMLElement;
        if (mkHeader) {
            // 1. Add div element to display preview-html
            const div = document.createElement("div");
            div.style.display = "none";
            textarea.after(div);

            // 2. Add a preview button
            const s = document.createElement("li");
            const previewBtn = document.createElement("li");
            const a = document.createElement("a");
            previewBtn.append(a);
            (mkHeader.firstChild as HTMLElement).append(s, previewBtn);
            a.href = "";
            a.textContent = "预览";
            a.setAttribute("title", "BBCode预览");
            s.setAttribute("class", "markItUpSeparator");
            s.textContent = "---------------";
            previewBtn.setAttribute("class", "markItUpButton markItUpButton16 preview");

            // 3. Add EventListener to preview button
            previewBtn.onclick = () => { return false; };
            previewBtn.addEventListener("click", evt => {
                if (textarea.style.display != "none") {
                    div.innerHTML = transform(textarea.value, MarkLang.BB, MarkLang.HTML).trim();
                    textarea.style.display = "none";
                    div.style.display = "block";
                } else {
                    textarea.style.display = "block";
                    div.style.display = "none";
                }
            });

            // 4. Response to submit event
            textarea.closest("#ReplysForm, #ReplyForm").addEventListener("submit", () => {
                textarea.style.display = "block";
                div.style.display = "none";
            });
        }
    }
}

export { previewRun };

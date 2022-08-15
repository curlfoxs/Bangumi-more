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

export { previewRun };

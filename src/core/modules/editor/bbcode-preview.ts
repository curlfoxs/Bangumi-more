import { transform, MarkLang } from "./outlined";

function previewRun () {
    const mkHeader = document.querySelector(".markItUpHeader") as HTMLElement;
    const mkTextarea = document.querySelector("textarea[name='content']") as HTMLTextAreaElement;
    if (mkHeader && mkTextarea) {
        const s = document.createElement("li");
        const previewBtn = document.createElement("li");
        const a = document.createElement("a");
        const div = document.createElement("div");
        div.style.display = "none";
        mkTextarea.after(div);

        s.setAttribute("class", "markItUpSeparator");
        s.textContent = "---------------";
        a.href = "";
        a.textContent = "预览";
        previewBtn.append(a);
        previewBtn.setAttribute("class", "markItUpButton markItUpButton15 preview");
        (mkHeader.firstChild as HTMLElement).append(s, previewBtn);
        previewBtn.onclick = () => { return false; };
        previewBtn.addEventListener("click", evt => {
            if (mkTextarea.style.display != "none") {
                const src = mkTextarea.value;
                const dest = transform(src, MarkLang.BB, MarkLang.HTML);
                div.innerHTML = dest.trim();
                mkTextarea.style.display = "none";
                div.style.display = "block";
            } else {
                mkTextarea.style.display = "block";
                div.style.display = "none";
            }
        });
    }
}

export { previewRun };

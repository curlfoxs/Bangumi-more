import { BbcodeParser } from "@/lib/bbcodeParser";

enum MarkLang {
    BB = "bbcode",
    HTML = "html",
    MD = "markdown"
}

function transform (src: string, from: MarkLang, to: MarkLang): undefined | string {
    if (src.length == 0) {
        return "";
    }
    switch (from) {
        case MarkLang.BB: {
            switch (to) {
                case MarkLang.HTML:{
                    const parser = new BbcodeParser();
                    return parser.bbcodeToHtml(src);
                    break;
                }
            }
            break;
        }
        case MarkLang.HTML: {
            break;
        }
        case MarkLang.MD: {
            break;
        }
        default: {
            break;
        }
    }
}

// function bb2HtmlParse(src: string): string {
//     let lexer = BBLexer();
//     let parser = HTMLParser();
//     return parser.parse(lexer.lex());
// }

export { transform, MarkLang };

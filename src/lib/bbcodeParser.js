// @see https://coursesweb.net/javascript/convert-bbcode-html-javascript_cs
// JS function to convert BBCode and HTML code - http;//coursesweb.net/javascript/
function BBCodeHTML() {
    var me = this;            // stores the object instance
    var token_match = /{[A-Z_]+[0-9]*}/ig;

    // regular expressions for the different bbcode tokens
    var tokens = {
      'URL' : '((?:(?:[a-z][a-z\\d+\\-.]*:\\/{2}(?:(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+|[0-9.]+|\\[[a-z0-9.]+:[a-z0-9.]+:[a-z0-9.:]+\\])(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)|(?:www\\.(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)))',
      'LINK' : '([a-z0-9\-\./]+[^"\' ]*)',
      'EMAIL' : '((?:[\\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*(?:[\\w\!\#$\%\'\*\+\-\/\=\?\^\`{\|\}\~]|&)+@(?:(?:(?:(?:(?:[a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(?:\\d{1,3}\.){3}\\d{1,3}(?:\:\\d{1,5})?))',
      'TEXT' : '((.|\n)*?)', // To cathc \n, fit for bangumi.tv
      'SIMPLETEXT' : '([a-zA-Z0-9-+.,_ ]+)',
      'INTTEXT' : '([a-zA-Z0-9-+,_. ]+)',
      'IDENTIFIER' : '([a-zA-Z0-9-_]+)',
      'COLOR' : '([a-z]+|#[0-9abcdef]+)',
      'NUMBER'  : '([0-9]+)'
    };

    var bbcode_matches = [];        // matches for bbcode to html

    var html_tpls = [];             // html templates for html to bbcode

    var html_matches = [];          // matches for html to bbcode

    var bbcode_tpls = [];           // bbcode templates for bbcode to html

    /**
     * Turns a bbcode into a regular rexpression by changing the tokens into
     * their regex form
     */
    var _getRegEx = function(str) {
      var matches = str.match(token_match);
      var nrmatches = matches.length;
      var i = 0;
      var replacement = '';

      if (nrmatches <= 0) {
        return new RegExp(preg_quote(str), 'g');        // no tokens so return the escaped string
      }

      for(; i < nrmatches; i += 1) {
        // Remove {, } and numbers from the token so it can match the
        // keys in tokens
        var token = matches[i].replace(/[{}0-9]/g, '');

        if (tokens[token]) {
          // Escape everything before the token
          replacement += preg_quote(str.substr(0, str.indexOf(matches[i]))) + tokens[token];

          // Remove everything before the end of the token so it can be used
          // with the next token. Doing this so that parts can be escaped
          str = str.substr(str.indexOf(matches[i]) + matches[i].length);
        }
      }

      replacement += preg_quote(str);      // add whatever is left to the string

      return new RegExp(replacement, 'mgi');
    };

    /**
     * Turns a bbcode template into the replacement form used in regular expressions
     * by turning the tokens in $1, $2, etc.
     */
    var _getTpls = function(str) {
      var matches = str.match(token_match);
      var nrmatches = matches.length;
      var i = 0;
      var replacement = '';
      var positions = {};
      var next_position = 0;

      if (nrmatches <= 0) {
        return str;       // no tokens so return the string
      }

      for(; i < nrmatches; i += 1) {
        // Remove {, } and numbers from the token so it can match the
        // keys in tokens
        var token = matches[i].replace(/[{}0-9]/g, '');
        var position;

        // figure out what $# to use ($1, $2)
        if (positions[matches[i]]) {
          position = positions[matches[i]];         // if the token already has a position then use that
        } else {
          // token doesn't have a position so increment the next position
          // and record this token's position
          next_position += 1;
          position = next_position;
          positions[matches[i]] = position;
        }

        if (tokens[token]) {
          replacement += str.substr(0, str.indexOf(matches[i])) + '$' + position;
          str = str.substr(str.indexOf(matches[i]) + matches[i].length);
        }
      }

      replacement += str;

      return replacement;
    };

    /**
     * Adds a bbcode to the list
     */
    me.addBBCode = function(bbcode_match, bbcode_tpl) {
      // add the regular expressions and templates for bbcode to html
      bbcode_matches.push(_getRegEx(bbcode_match));
      html_tpls.push(_getTpls(bbcode_tpl));

      // add the regular expressions and templates for html to bbcode
      html_matches.push(_getRegEx(bbcode_tpl));
      bbcode_tpls.push(_getTpls(bbcode_match));
    };

    /**
     * Turns all of the added bbcodes into html
     */
    me.bbcodeToHtml = function(str) {
      var nrbbcmatches = bbcode_matches.length;

      /**
       * Fit [code] [/code] for bangumi.tv, reserve content in [code]
       */
      var quoteMatches = str.match(bbcode_matches[0]);
      str = str.replace(bbcode_matches[0], "[code][/code]");

      console.log(str)
      /* Replace all matches until not replace happen, fit for bangumi.tv
       * @see https://stackoverflow.com/questions/5257000/how-to-know-if-javascript-string-replace-did-anything
       * To see whether replace did anython?
       */
      for(let i=1; i < nrbbcmatches; i += 1) {
        while (str.search(bbcode_matches[i]) >= 0) {
            str = str.replace(bbcode_matches[i], html_tpls[i]);
        }
      }
      /**
       * Replace \n to <br>, fit for bangumi.tv
       * Add <br><br> at the top
       */
      str = str.replace(RegExp('\\n', 'gi'), '<br>')
      str = '<br><br>' + str;

      /**
       * Fit [code] [/code] for bangumi.tv, reserve content in [code]
       */
      var splices = str.split("[code][/code]");
      str = '';
      var j = 0;
      for (; j<quoteMatches.length; ++j) {
        quoteMatches[j] = quoteMatches[j].replace(bbcode_matches[0], html_tpls[0]);
        str += splices[j] + quoteMatches[j];
      }
      if (j < splices.length) {str += splices[j];}

      console.log(str);
      return str;
    };

    /**
     * Turns html into bbcode
     */
    me.htmlToBBCode = function(str) {
      var nrhtmlmatches = html_matches.length;
      var i = 0;

      for(; i < nrhtmlmatches; i += 1) {
        str = str.replace(html_matches[i], bbcode_tpls[i]);
      }

      return str;
    }

    /**
     * Quote regular expression characters plus an optional character
     * taken from phpjs.org
     */
    function preg_quote (str, delimiter) {
      return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
    }

    // adds BBCodes and their HTML
    me.addBBCode('[code]{TEXT}[/code]', '<div class="codeHighlight"><pre>{TEXT}</pre></div>');
    me.addBBCode('[quote]{TEXT}[/quote]', '<div class="quote"><q>{TEXT}</q></div>');
    me.addBBCode('[b]{TEXT}[/b]', '<strong>{TEXT}</strong>');
    me.addBBCode('[i]{TEXT}[/i]', '<em>{TEXT}</em>');
    me.addBBCode('[u]{TEXT}[/u]', '<span style="text-decoration:underline;">{TEXT}</span>');
    me.addBBCode('[s]{TEXT}[/s]', '<span style="text-decoration:line-through;">{TEXT}</span>');
    me.addBBCode('[url={URL}]{TEXT}[/url]', '<a href="{URL}" target="_blank" rel="nofollow external noopener noreferrer" class="l">{TEXT}</a>');
    me.addBBCode('[url]{URL}[/url]', '<a href="{URL}" target="_blank" rel="nofollow external noopener noreferrer" class="l">{URL}</a>');
    me.addBBCode('[img={NUMBER1},{NUMBER2}]{URL}[/img]', '<img width="{NUMBER1}" height="{NUMBER2}" src="{URL}" class="code" rel="noreferrer" referrerpolicy="no-referrer" alt=""/>');
    me.addBBCode('[img={NUMBER1}x{NUMBER2}]{URL}[/img]', '<img width="{NUMBER1}" height="{NUMBER2}" src="{URL}" class="code" rel="noreferrer" referrerpolicy="no-referrer" alt=""/>');
    me.addBBCode('[img]{URL}[/img]', '<img src="{URL}" class="code" rel="noreferrer" referrerpolicy="no-referrer" alt=""/>');
    me.addBBCode('[color={COLOR}]{TEXT}[/color]', '<span style="color: {COLOR}">{TEXT}</span>');
    me.addBBCode('[size={NUMBER}]{TEXT}[/size]', '<span style="font-size: {NUMBER}pt">{TEXT}</span>');
    me.addBBCode('[mask]{TEXT}[/mask]', '<span style="background-color:#555;color:#555;border:1px solid #555;">{TEXT}</span>');
  };


export const bbcodeParser = new bbcodeParser();        // creates object instance of BBCodeHTML()

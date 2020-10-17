(async () => {
  // ref: https://medium.com/@otiai10/how-to-use-es6-import-with-chrome-extension-bd5217b9c978
  const abbrModuleFile = chrome.extension.getURL('abbreviations.mjs');
  const abbrModule = await import(abbrModuleFile);
  const abbr = abbrModule.getAll();

  const debClassName = 'debreviated';

  /**
   * Generate HTML abbr tag.
   * @param {string} definition
   * @param {string} abbreviation
   */
  const makeAbbr = (definition, abbreviation) => {
    return `<abbr title="${definition}">${abbreviation}</abbr>`
  };

  /**
   * Find abbreviations in current selection and generate abbr tags.
   */
  const debreviate = () => {
    const range = window.getSelection();
    const selectedEl = range.focusNode.parentElement;

    if (selectedEl.classList.contains(debClassName)) return console.log('Already debreviated.');

    const result = {};

    for (key in abbr) {
      // regex breakdown:
      // (?<!<(?:script|abbr)[^>]*) <-- non-capture group: don't look inside script or abbr tags
      // (>[^<]*)                   <-- capture group 1: get closing HTML tag followed by anything but an opening tag
      // (\\b${key}\\b)             <-- capture group 2: get target string that has word boundaries
      const reComplex = new RegExp(`(?<!<(?:script|abbr)[^>]*)(>[^<]*)(\\b${key}\\b)`, 'gi');
      const reBasic = new RegExp(`(\\b${key}\\b)`, 'gi');

      const output = [];
      result[key] = 0;

      const selectedHtml = selectedEl.innerHTML;
      const firstBracket = selectedHtml.indexOf('<');

      // Skip the complex regex if there are no brackets.
      if (firstBracket === -1) {
        output.push(selectedHtml.replaceAll(reBasic, (match, cap1) => {
          result[key] += 1;
          selectedEl.classList.add(debClassName);

          return makeAbbr(abbr[key], cap1);
        }));
      } else {
        // Most selected text will begin without brackets and so will be missed by reComplex.
        // The following is a hack until a better regex can be written. sigh
        output.push(selectedHtml.slice(0, firstBracket).replaceAll(reBasic, (match, cap1) => {
          result[key] += 1;
          selectedEl.classList.add(debClassName);

          return makeAbbr(abbr[key], cap1);
        }));

        output.push(selectedHtml.slice(firstBracket).replaceAll(reComplex, (match, cap1 = '', cap2) => {
          result[key] += 1;
          selectedEl.classList.add(debClassName);

          return `${cap1}${makeAbbr(abbr[key], cap2)}`;
        }));
      }

      if (result[key] < 1) delete result[key];

      selectedEl.innerHTML = output.join('');
    }

    console.table(result);
  };

  chrome.runtime.onMessage.addListener(request => debreviate());
})();

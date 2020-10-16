const abbr = {
  "api": "Application Programming Interface",
  "css": "Cascading Style Sheets",
  "html": "HyperText Markup Language",
  "html5": "HyperText Markup Language 5",
  "json": "JavaScript Object Notation",
  "js": "JavaScript",
  "mdn": "Mozilla Developer Network",
  "xhtml": "Extensible HyperText Markup Language",
  "xml": "Extensible Markup Language",
};

const bodyEl = document.body;
const count = {};

for (key in abbr) {
  // regex breakdown:
  // (?<!<(?:script|abbr)[^>]*) <-- non-capture group: don't look inside script or abbr tags
  // (>[^<]*)                   <-- capture group 1: get closing HTML tag followed by anything but an opening tag
  // (\\b${key}\\b)             <-- capture group 2: get target string that has word boundaries
  const re = new RegExp(`(?<!<(?:script|abbr)[^>]*)(>[^<]*)(\\b${key}\\b)`, 'gi')

  count[key] = 0;

  bodyEl.innerHTML = bodyEl.innerHTML.replaceAll(re, (match, cap1, cap2) => {
    count[key] += 1;

    return `${cap1}<abbr title="${abbr[key]}">${cap2}</abbr>`;
  });

  if (count[key] < 1) delete count[key];
}

const msg = (Object.keys(count).length)
  ? 'Abbreviations defined (and counted):'
  : 'No pre-defined abbreviations found.'

console.info(msg);
console.table(count);

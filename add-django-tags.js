const fs = require("fs");

// "{%  static 'hms/webapp/favicon.ico' %}"
const loadStatic = `{% load static %}`;
let loadStaticInserted = false;
const dStaticStart = `"{% static '`;
const dStaticEnd = `' %}"`;

// index.html path
const indexPath = "./dist/webapp/static/index.html";

// django static file path
const djangoPath = "hms/webapp/";

log("Adding Django static tags to index.html");

fs.readFile(indexPath, "utf8", (err, file) => {
  if (file) {
    processFile(file);
  }
  if (err) {
    log(`[ERROR]::Failed to ${err.syscall} ${err.path}`);
  }
});

function processFile(file) {
  const rows = file.split("\n");
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    if (row.trim().startsWith("<link") || row.trim().startsWith("<script")) {
      row = row.trim();
      let rowProperties = row.split(" ");
      for (let j = 0; j < rowProperties.length; j++) {
        let prop = rowProperties[j];
        if (prop.startsWith("href") || prop.startsWith("src")) {
          log(`adding static tag`);
          let newProp = prop.split('"');
          let nProp = `${newProp[0]}${dStaticStart}${djangoPath}${newProp[1]}${dStaticEnd}${newProp[2]}`;
          rowProperties[j] = nProp;
        }
      }
      newRow = `  ${rowProperties.join(" ")}`;
      if (!loadStaticInserted) {
        log(`adding load static tag`);
        newRow = `  ${loadStatic}\n${newRow}`;
        loadStaticInserted = true;
      }
      rows[i] = newRow;
    }
  }

  file = rows.join("\n");
  fs.writeFile(indexPath, file, "utf8", (err, res) => {
    if (err) {
      log(`[ERROR]::Failed to ${err.syscall} ${err.path}`);
      return;
    }
    log("Completed adding static tags");
  });
}

function log(message) {
  console.log(`[Post Build]::${message}`);
}

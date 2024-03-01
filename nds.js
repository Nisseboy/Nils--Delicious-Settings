let ndsHasInit = false;

function initializeSettings(parentElem, settings, settingsTemplate, prefix = "nds") {
  let names = Object.keys(settingsTemplate);
  
  for (let name of names) {
    let template = settingsTemplate[name];

    let val;
    if (template.type != "button") val = template.defaultValue;
    if (template.type == "folder") val = {};
    if (settings[name] != undefined) val = settings[name];
    settings[name] = val;

    let uniqueID = prefix + "-" + name;
    let ndsType = ndsTypes[template.type];
    let elemString = ndsType.createElement(template, name, val, uniqueID);

    let rowElemString = `
    ${ndsType.domElemRowIsLabel?`<label class="setting" for="${uniqueID}">`:`<div class="setting">`}
      <div class="setting-side ${template.type}"></div>
      <div class="setting-name">
        ${template.type == "folder"?"<div class=\"setting-name-folder-carat\">></div>":""}
        ${template.displayName || name}
      </div>
      <div class="setting-box">
      
      </div>
    ${ndsType.domElemRowIsLabel?"</label>":"</div>"}
    `;
    parentElem.insertAdjacentHTML("beforeend", rowElemString);
    let rowElem = parentElem.lastElementChild;

    let settingBox = rowElem.getElementsByClassName("setting-box")[0];
    settingBox.insertAdjacentHTML("beforeend", elemString);
    let elem = settingBox.lastElementChild;

    ndsType.hydrateElement(elem, template, name, settings, uniqueID);
  }

  if (!ndsHasInit) {
    let stylesElem = document.createElement("style");
    stylesElem.innerText = `
    #settings {
      --menu-color: #191919;
      --row-color: var(--menu-color);
      --input-background: #262626;
      --text-color: #fff;
      
      --input-theme-checkbox: #624e66;
      --input-theme-range: #2683ae;
      --input-theme-radio: #840fd1;
      --input-theme-button: #f0514c;
      --input-theme-string: #49d149;
    
      opacity: 0.8;
    
      position: absolute;
      top: 0;
      right: 1rem;
      width: 19rem;
    
      font-family: monospace,s;
      font-size: 1rem;
    
      background-color: var(--menu-color);
      color: var(--text-color);
    }
    
    .setting {
      width: 100%;
      display: flex;
      align-items: center;
    
      border-bottom: 1px solid #2c2c2c;
    
      background-color: var(--row-color);  
      
      position: relative;
    }
    
    
    .setting-side {
      width: 0.1rem;
      margin-right: 0.4rem;
      height: 100%;  
      position: absolute;
    }
    
    .setting-name {
      width: 35%;
      user-select: none;
      margin-left: 0.45rem;
      pointer-events: none;
    
      display: flex;
      gap: 1ch;
    }
    
    .setting-box {
      padding: 0.2rem;
      width: 65%;
      height: 100%;
    }
    `;
    for (let i in ndsTypes) if (ndsTypes[i].styles) stylesElem.innerText += ndsTypes[i].styles;
    document.head.appendChild(stylesElem);
  }
  ndsHasInit = true;
}

let ndsTypes = {
  checkbox: {
    domElemRowIsLabel: true,

    createElement: function(template, name, value, uniqueID) {
      return `
      <div class="setting-value checkbox-visible"></div>
      <input type="checkbox" id="${uniqueID}" class="setting-value checkbox" ${value?" checked":""}>
      `;
    },
    hydrateElement: function(domElem, template, name, settings, uniqueID) {
      domElem.addEventListener("click", e => {
        let old = settings[name];
        settings[name] = domElem.checked;
        if (template.callback) template.callback(domElem.checked, old);
      });
    },

    styles: `
    .setting-side.checkbox { background-color: var(--input-theme-checkbox); }
    
    .setting:has(>.checkbox):hover,
    .setting:has(>.button):hover {
      background-color: color-mix(in srgb, var(--row-color) 50%, #000);
      cursor: pointer;
    }
    
    .setting-value.button {
      opacity: 0;
      width: 0;
      height: 0;
      cursor: pointer;
    }
    .setting-value.checkbox {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
      cursor: pointer;
    }
    .setting-value.checkbox-visible {
      margin: 0;
      background-color: var(--input-background);
      height: 1.6rem;
      aspect-ratio: 1 / 1;
      min-height: 100%;
      position: relative;
    }
    .setting-value.checkbox-visible:has(~ .setting-value.checkbox:checked) {
      background-color: var(--input-theme-range);
    }
    
    .setting-value.checkbox-visible:after {
      content: "";
      position: absolute;
      display: none;
    }
    .setting-value.checkbox-visible:has(~ .setting-value.checkbox:checked)::after {
      display: block;
    }
    .setting-value.checkbox-visible:after {
      left: 35%;
      top: 20%;
      width: 20%;
      height: 40%;
      border: solid var(--text-color);
      border-width: 0 0.2rem 0.2rem 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
    }
    
    `,
  },
  range: {
    domElemRowIsLabel: false,

    createElement: function(template, name, value, uniqueID) {
      return `
      <div class="setting-value range-holder">
        <div class="setting-value range">
          <div class="range-active">
          </div>
        </div>
        <input class="setting-value number">
      </div>
      `;
    },
    hydrateElement: function(domElem, template, name, settings, uniqueID) {
      let range = (template.max - template.min);

      let numElem = domElem.getElementsByClassName("number")[0];
      let elem = domElem.getElementsByClassName("range")[0];

      numElem.value = settings[name];
      elem.style.setProperty("--range-fullness", (settings[name] - template.min) / range * 100 + "%");

      let bounding = {box: {x:0,width:0}};

      const setValue = (value, end) => {
        value = Math.round(Math.max(Math.min(value, template.max), template.min) / template.step) * template.step;
        
        let str = ("" + value);
        let str2 = "";
        let decimalI = -1;
        for (let i = 0; i < str.length; i++) {
          if (str[i] == ".") decimalI = 0;

          if (decimalI - 1 > template.maxDecimals - 1) break;
          str2 += str[i];
          if (decimalI != -1) decimalI++;
        }

        value = parseFloat(str2);

        elem.style.setProperty("--range-fullness", (value - template.min) / range * 100 + "%");
        numElem.value = value;

        numElem.blur();
        
        if (settings[name] == value) return;
        if (!(template.callbackFreq == "end" && !end)) {
          let old = settings[name];
          settings[name] = value;
          if (template.callback) template.callback(value, old);
        }
      }

      const mousedown = (e) => {
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
        bounding.box = elem.getBoundingClientRect();
        mousemove(e);
      }
      const mousemove = (e) => {
        let box = bounding.box;
        let x = (e.clientX - box.x) / (box.width);

        let value = x * range + template.min;
        setValue(value);
        
        bounding.value = value;
      }
      const mouseup = () => {
        setValue(bounding.value, true);
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
      }
      elem.addEventListener("mousedown", mousedown);

      numElem.addEventListener("change", e => {
        setValue(numElem.value, true);
      });
    },

    styles: `
    .setting-side.range { background-color: var(--input-theme-range); }

    .setting-value.range-holder {
      width: 100%;
      min-height: 100%;
    
      display: flex;
      gap: 0.3rem;
    }
    .setting-value.range {
      width: 200%;
      min-height: 100%;
    
      cursor: e-resize;
      background-color: var(--input-background);
    }
    .range-active {
      width: var(--range-fullness);
      height: 100%;
    
      pointer-events: none;
    
      background-color: var(--input-theme-range);
    }
    
    .setting-value.range:hover {
      filter: brightness(1.2);
    }
    `,
  },
  radio: {
    domElemRowIsLabel: false,

    createElement: function(template, name, value, uniqueID) {
      
      let elem = "";
      for (let i in template.values) {
        let val = template.values[i];

        elem += `
        <button class="setting-value radio-row${(val.value == value || val.name == value)?" checked":""}">${val.html || val.name}</button>
        `;
      }
      return elem;
    },
    hydrateElement: function(domElem, template, name, settings, uniqueID) {
      let elems = domElem.parentElement.getElementsByClassName("radio-row");
      for (let i = 0; i < elems.length; i++) {
        let elem = elems[i];
        elem.addEventListener("click", e => {
          domElem.parentElement.getElementsByClassName("checked")[0].classList.remove("checked");
          elem.classList.add("checked");

          let value = template.values[i].value;
          if (value == undefined) value = template.values[i].name;
          if (settings[name] == value && template.callbackFreq != "click") return;
          let old = settings[name];
          settings[name] = value;
          if (template.callback) template.callback(value, old);
        });
      }
    },
    
    styles: `
    .setting-side.radio { background-color: var(--input-theme-radio); }
    
    .setting-value.radio-row {
      width: 100%;
      height: 100%;
      padding: 0.2rem;
      border-radius: 0;
      border: 0;
      margin-bottom: 0.2rem;

      font-family: inherit;
      font-size: inherit;

      background-color: var(--input-background);
      color: var(--text-color);

      cursor: pointer;
    }
    .setting-value.radio-row.checked {
      background-color: color-mix(in srgb, var(--input-theme-radio) 50%, var(--input-background));
    }
    .setting-value.radio-row:hover {
      filter: brightness(1.2);
    }
    `,
  },
  button: {
    domElemRowIsLabel: true,

    createElement: function(template, name, value, uniqueID) {
      return `
      <input type="button" id="${uniqueID}" class="setting-value button">
      `;
    },
    hydrateElement: function(domElem, template, name, settings, uniqueID) {
      domElem.addEventListener("click", e => {
        if (template.callback) template.callback();
      });
    },

    styles: ".setting-side.button { background-color: var(--input-theme-button); }", //Styles for buttons are bundled with the styles for checkboxes
  },
  folder: {
    domElemRowIsLabel: false,

    createElement: function(template, name, value, uniqueID) {
      return `
      <div class="setting-value folder${template.startOpen?" open":""}"></div>
      `;
    },
    hydrateElement: function(domElem, template, name, settings, uniqueID) {
      initializeSettings(domElem, settings[name], template.settings, uniqueID);
      domElem.parentElement.parentElement.addEventListener("click", e => {
        if (e.target == domElem.parentElement.parentElement) {
          domElem.classList.toggle("open");
        }
      });
    },
    
    styles: `
    .setting:has(.folder) {
      background-color: black;
      display: block;
      
      height: 1.65rem;
      overflow: hidden;
    }
    .setting:has(.folder.open) {
      height: auto;
      overflow-y: auto;
    }
    .setting-name-folder-carat {
      width: 1rem;
      height: 1rem;
      text-align: center;
      vertical-align: middle;
      line-height: 1rem;  
    }
    .setting:has(.folder.open) .setting-name-folder-carat {
      rotate: 90deg;
    }
    .setting:has(.folder):not(:has(*:hover)):hover {
      cursor: pointer;
    }
    .setting-box:has(.folder) {
      width: 100%;
    }
    .setting:has(.folder)>.setting-name {
      width: 100%;
      margin-top: 0.2rem;
    }
    `,
  },
  number: {
    domElemRowIsLabel: false,
  
    createElement: function(template, name, value, uniqueID) {
      return `
        <input class="setting-value number" value="${value}">
      `;
    },
    hydrateElement: function(domElem, template, name, settings, uniqueID) {
      domElem.addEventListener("change", e => {
        let value = Math.round(Math.max(Math.min(parseFloat(domElem.value), template.max), template.min) / template.step) * template.step;
        
        let str = ("" + value);
        let str2 = "";
        let decimalI = -1;
        for (let i = 0; i < str.length; i++) {
          if (str[i] == ".") decimalI = 0;

          if (decimalI - 1 > template.maxDecimals - 1) break;
          str2 += str[i];
          if (decimalI != -1) decimalI++;
        }

        domElem.value = value;
        domElem.blur();
        
        if (settings[name] == value) return;
        let old = settings[name];
        settings[name] = value;
        if (template.callback) template.callback(value, old);
      });
    },
  
    styles: `
    .setting-side.number { background-color: var(--input-theme-range); }

    .setting-value.number:hover {
      filter: brightness(1.2);
    }

    .setting-value.number {
      border: none;
      background-color: var(--input-background);
      color: var(--input-theme-range);
      font-family: inherit;
      font-size: 1rem;
    
      outline: none;
    
      width: 100%;
    }
    .setting-value.number:focus {
      color: var(--text-color);
    }
    `,
  },
  string: {
    domElemRowIsLabel: false,
  
    createElement: function(template, name, value, uniqueID) {
      return `
        <input class="setting-value string" value="${value}"${(template.maxLength != undefined)?` maxlength=\"${template.maxLength}\"`:""}>
      `;
    },
    hydrateElement: function(domElem, template, name, settings, uniqueID) {
      domElem.addEventListener("change", e => {
        domElem.blur();
        
        if (settings[name] == domElem.value) return;
        let old = settings[name];
        settings[name] = domElem.value;
        if (template.callback) template.callback(domElem.value, old);
      });
    },
  
    styles: `
    .setting-side.string { background-color: var(--input-theme-string); }

    .setting-value.string:hover {
      filter: brightness(1.2);
    }

    .setting-value.string {
      border: none;
      background-color: var(--input-background);
      color: var(--input-theme-string);
      font-family: inherit;
      font-size: 1rem;
    
      outline: none;
    
      width: 100%;
    }
    .setting-value.string:focus {
      color: var(--text-color);
    }
    `,
  }
};



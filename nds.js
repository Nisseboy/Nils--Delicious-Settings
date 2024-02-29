function initializeSettings(parentElem, settings, settingsTemplate, prefix = "") {
  let names = Object.keys(settingsTemplate);

  for (let name of names) {
    let template = settingsTemplate[name];

    let val;
    if (template.type != "button") val = template.defaultValue;
    if (template.type == "folder") val = {};
    if (settings[name] != undefined) val = settings[name];
    settings[name] = val;

    let elemString = "";

    switch(template.type) {
      case "checkbox":
        elemString = `
        <div class="setting-value checkbox-visible"></div>
        <input type="checkbox" id="${prefix}-${name}" class="setting-value checkbox" ${val?" checked":""}>
        `;
        break;
      case "range":
        elemString = `
        <div class="setting-value range-holder">
          <div class="setting-value range">
            <div class="range-active">
            </div>
          </div>
          <input class="setting-value input">
        </div>
        `;
        break;
      case "radio":
        elemString = "";
        for (let i in template.values) {
          let value = template.values[i];

          elemString += `
          <button class="setting-value radio-row${(i == val)?" checked":""}">${value.html || value.name}</button>
          `;
        }
        break;
      case "button":
        elemString = `
        <input type="button" id="${prefix}-${name}" class="setting-value button">
        `;
        break;
      case "folder":
        elemString = `
        <div class="setting-value folder${template.defaultValue?" open":""}"></div>
        `;
        break;
    }

    let rowElemString = `
    ${(template.type == "checkbox" || template.type == "button")?`<label class="setting" for="${prefix}-${name}">`:`<div class="setting">`}
      <div class="setting-side ${template.type}"></div>
      <div class="setting-name">
        ${template.type == "folder"?"<div class=\"setting-name-folder-carat\">></div>":""}
        ${template.displayName || name}
      </div>
      <div class="setting-box">
      
      </div>
    ${(template.type == "checkbox" || template.type == "button")?"</label>":"</div>"}
    `;
    parentElem.insertAdjacentHTML("beforeend", rowElemString);
    let rowElem = parentElem.lastElementChild;

    let settingBox = rowElem.getElementsByClassName("setting-box")[0];
    settingBox.insertAdjacentHTML("beforeend", elemString);
    let elem = settingBox.lastElementChild;

    switch(template.type) {
      case "checkbox":
        elem.addEventListener("click", e => {
          let old = settings[name];
          settings[name] = elem.checked;
          if (template.callback) template.callback(elem.checked, old);
        });
        break;

      case "range":
        let range = (template.max - template.min);

        let numElem = elem.getElementsByClassName("input")[0];
        elem = elem.getElementsByClassName("range")[0];

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

        break;
    
      case "radio":
        settings[name] = template.values[val].value || template.values[val].name;
        
        let elems = rowElem.getElementsByClassName("radio-row");
        for (let i = 0; i < elems.length; i++) {
          let elem = elems[i];
          elem.addEventListener("click", e => {
            rowElem.getElementsByClassName("checked")[0].classList.remove("checked");
            elem.classList.add("checked");

            let value = template.values[i].value ||template.values[i].name;
            if (settings[name] == value && template.callbackFreq != "click") return;
            let old = settings[name];
            settings[name] = value;
            if (template.callback) template.callback(value, old);
          });
        }
        break;
        
      case "button":
        elem.addEventListener("click", e => {
          if (template.callback) template.callback();
        });
        break;
        
      case "folder":
        initializeSettings(elem, settings[name], template.settings, name + "-" + prefix);
        rowElem.addEventListener("click", e => {
          if (e.target == rowElem) {
            elem.classList.toggle("open");
          }
        });
        break;
    }
  }
}


  let stylesElem = document.createElement("style");
  stylesElem.innerText = `
  
#settings {
  --menu-color: #000;
  --row-color: #191919;
  --input-background: #262626;
  --text-color: #fff;
  
  --input-theme-checkbox: #624e66;
  --input-theme-range: #2683ae;
  --input-theme-radio: #840fd1;
  --input-theme-button: #f0514c;

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

.setting:has(>.checkbox):hover,
.setting:has(>.button):hover {
  background-color: color-mix(in srgb, var(--row-color) 50%, var(--menu-color));
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

.setting-value.range:hover,
.setting-value.input:hover {
  filter: brightness(1.2);
}

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

.setting-value.input {
  border: none;
  background-color: var(--input-background);
  color: var(--input-theme-range);
  font-family: inherit;
  font-size: 1rem;

  outline: none;

  width: 100%;
}
.setting-value.input:focus {
  color: var(--text-color);
}

.setting-side {
  width: 0.1rem;
  margin-right: 0.4rem;
  height: 100%;  
  position: absolute;
}
.setting-side.checkbox { background-color: var(--input-theme-checkbox); }
.setting-side.range { background-color: var(--input-theme-range); }
.setting-side.radio { background-color: var(--input-theme-radio); }
.setting-side.button { background-color: var(--input-theme-button); }

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
  document.head.appendChild(stylesElem);
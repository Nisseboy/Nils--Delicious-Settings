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
          <button class="setting-value radio-row${(i == val)?" checked":""}">${value.name}</button>
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
          template.callback(elem.checked, settings[name]);
          settings[name] = elem.checked;
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
            template.callback(value, settings[name]);
            settings[name] = value;
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
            template.callback(value, settings[name]);
            settings[name] = value;
          });
        }
        break;
        
      case "button":
        elem.addEventListener("click", e => {
          template.callback();
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
  
  `;
  document.head.appendChild(stylesElem);
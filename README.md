Small library for simple settings menus

#Usage
```html
<!DOCTYPE html>
<head>
  <script src="https://cdn.jsdelivr.net/gh/Nisseboy/Nils--Delicious-Settings@master/nds.js"></script>
</head>
<body>
  The id of the settings element has to be "settings"
  <div id="settings"></div>
  <script src="index.js"></script>
</body>
</html>
```

```js
//Settings is the object you can access the values from, you can also initialize the values like this for them to be the default values if you want to save/load settings
let settings = {
  checkbox: true,
  range: 0.3,
  radio: "op. 1", //in this case it could be "op. 1", "option 2", or "option 3"
  folder: {
    checkbox: true,
    range: 50,
  },
};
const settingsTemplate = {
  checkbox: {
    displayName: "checkbox", //optional parameter for all settings
    type: "checkbox",
    defaultValue: false,
    callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
  },
  range: {
    type: "range",
    defaultValue: 0.75,
    min: 0,
    max: 1,
    step: 0.01, //the precision the value is rounded to
    maxDecimals: 2, //how many decimals the value can have
    callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
    callbackFreq: "end", //if end, triggers callback when number changes or the slider is released, otherwise when number changes and every frame the slider is changed
  },
  radio: {
    type: "radio",
    defaultValue: "op. 1",
    values: [
      {name: "option 1", value: "op. 1"}, //returns "op. 1" when clicked
      {name: "option 2"}, //returns "option 2" when clicked
      {name: "option 3", html: "<div>hello</div>"}, //html replaces the name of the options with custom html
    ],
    callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
    callbackFreq: "click", //if click, triggers callback every time a radio button is CLICKED, otherwise every time the value CHANGES
  },
  folder: {
    type: "folder",
    defaultValue: true, //false is closed, true is open
    settings: {
      checkbox: {
        type: "checkbox",
        defaultValue: false,
        callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
      },
      range: {
        type: "range",
        defaultValue: 30,
        min: 0,
        max: 100,
        step: 1,
        maxDecimals: 0,
        callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
      },
    }
  },
  button: {
    type: "button",
    callback: () => {console.log("button pressed");},
  }
};

initializeSettings(document.getElementById("settings"), settings, settingsTemplate);
```
This will produce this menu
![alt text](image.png)


#Custom Types
Implementation of number input (this can be applied to anything). You can check more advanced usage in nds.js in the variable ndsTypes
```js
let settings = {};
let settingsTemplate = {
  age: {
    type: "number",
    defaultValue: 25,
    min: 0,
    max: 100,
    step: 1, //the precision the value is rounded to
    maxDecimals: 0, //how many decimals the value can have
    callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
  },
};

ndsTypes["number"] = {
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
};

initializeSettings(document.getElementById("settings"), settings, settingsTemplate);
```
This will produce this menu
![alt text](image-1.png)
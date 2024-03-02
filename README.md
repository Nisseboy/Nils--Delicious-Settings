Small library for simple settings menus

# Usage
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
  checkbox: false,
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
  number: {
    type: "number",
    defaultValue: 0.75,
    min: 0,
    max: 1,
    step: 0.01, //the precision the value is rounded to
    maxDecimals: 2, //how many decimals the value can have
    callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
  },
  string: {
    type: "string",
    defaultValue: "Example",
    maxLength: 10, //max length of the string
    callback: (newVal, oldVal) => {console.log(oldVal, newVal);},
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
    startOpen: true,
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

You can change the styling of the menu like this.
```css
#settings {
  --menu-color: #ff0000 !important;
  --row-color: var(--menu-color);
  --input-background: #ff0000 !important;
  --text-color: #ff0000 !important;

  --reset-color: #ff0000 !important;
  
  --input-theme-checkbox: #ff0000 !important;
  --input-theme-range: #ff0000 !important;
  --input-theme-radio: #ff0000 !important;
  --input-theme-button: #ff0000 !important;
  --input-theme-string: #ff0000 !important;
  
  width: 50rem !important;

  font-family: monospace,s !important;

  opacity: 0.1 !important;

  /*Move the menu to the left side*/
  right: unset;
  left: 0.2rem;
}
```

# Custom Types
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
  domElemRowIsLabel: false, //Should the row element be a label so clicking it also clicks the button? check the implementation of checkbox for more info
  canBeReset: true, //Should a reset button pop up next to it if the value isn't it's default?

  //Return your element, shouldn't include values
  createElement: function(template, name, uniqueID) {
    return `
      <input class="setting-value number">
    `;
  },
  //Javsacriptify your element
  hydrateElement: function(domElem, template, name, settings, setValueFn, uniqueID) {
    domElem.addEventListener("change", e => {
      //Ensures value is within bounds and follows step
      let value = Math.round(Math.max(Math.min(parseFloat(domElem.value), template.max), template.min) / template.step) * template.step;
      
      //Removes trailing decimals
      let str = ("" + value);
      let str2 = "";
      let decimalI = -1;
      for (let i = 0; i < str.length; i++) {
        if (str[i] == ".") decimalI = 0;

        if (decimalI - 1 > template.maxDecimals - 1) break;
        str2 += str[i];
        if (decimalI != -1) decimalI++;
      }

      //Unfocus element after input
      domElem.blur();
      
      //Don't run the callback if the value hasn't changed
      if (settings[name] == value) return;

      //Call this function to set the setting value, this will call your setValue function, potentially call the callback and initialize reset buttons etc
      setValueFn(value);
    });
  },
  //Define how nds should display your value, also called right after before
  setValue: function(domElem, template, name, value) {
    domElem.value = value;
  },

  //Custom styles for your element
  styles: `
  /*What color the bar beside the row is*/
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
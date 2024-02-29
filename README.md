Small library for simple settings menus

Example Usage
```html
<!DOCTYPE html>
<head>
  <script src="https://cdn.jsdelivr.net/gh/Nisseboy/Nils--Delicious-Settings@master/nds.js"></script>
</head>
<body>
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
  radio: 1,
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
    defaultValue: 0, //index in value array
    values: [
      {name: "option 1", value: "op. 1"}, //returns "op. 1" when clicked
      {name: "option 2"}, //returns "option 2" when clicked
      {name: "option 3"},
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
this will produce this menu
![alt text](image.png)
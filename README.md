# magicform
HTML form serialization and AJAX submitting library.

This library can serialize a form into JSON object, or deserialize a JSON object to fields of a form.

It also supports AJAX submitting of a form (need Promise support or es6-promise polyfill).

No jQuery dependency.

## Usages

### window.MagicForm.parse(formElem: HTMLFormElement, data: any)
Deserialize a JSON object into a form.

Example:
```html
<form id="testMultipleFieldsForm">
    <input type="hidden" class="f-id" name="id">
    <input type="text" class="f-key" name="key">
    <input type="number" class="f-flag" name="flag">
    <input type="text" class="f-reason" name="reason">
</form>
```
Execute:
```js
MagicForm.parse(document.getElementById("testMultipleFieldsForm"), { id: 1, key: 2, flag: 3, reason: "hello" });
```
Result:
```html
<form id="testMultipleFieldsForm">
    <input type="hidden" class="f-id" name="id" value="1">
    <input type="text" class="f-key" name="key" value="2">
    <input type="number" class="f-flag" name="flag" value="3">
    <input type="text" class="f-reason" name="reason" value="hello">
</form>
```

More field name convention can be found in ```tests``` folder.

### window.MagicForm.serialize(formElem: HTMLFormElement) -> any
Serialize a form into a JSON object.

```html
<form id="testMultipleFieldsForm">
    <input type="hidden" class="f-id" name="id" value="1">
    <input type="text" class="f-key" name="key" value="2">
    <input type="number" class="f-flag" name="flag" value="3">
    <input type="text" class="f-reason" name="reason" value="hello">
</form>
```
Execute:
```js
MagicForm.serialize(document.getElementById("testMultipleFieldsForm"));
```
Result:
```js
{ id: 1, key: 2, flag: 3, reason: "hello" }
```

### window.MagicForm.serializeSimple(formElem: HTMLFormElement) -> any
Serialize a form into a JSON object, but without nested structure.

### window.MagicForm.serializePlain(formElem: HTMLFormElement) -> String
Serialize a form into a query string.

### window.MagicForm.ajaxSubmit(formElem: HTMLFormElement, hooks: any) -> Promise
AJAX submit a form immediately.

The object ```hooks``` may contains below functions:

##### beforeSubmit(data: any | FormData) -> Promise | Boolean
This function will be called before submitting the form. You can modify data before submitting.

Return a value any other than ```true``` or ```Promise.resolve(true)``` will prevent the form from submitting. 

### window.MagicForm.ajaxify(formElem: HTMLFormElement, hooks: any) -> Promise
Make a form do AJAX submit when submit button is clicked.

The object ```hooks``` is the same as ```hooks``` in ```window.MagicForm.ajaxSubmit```.

## Browser compatiblity
IE 9+ (<9 may work, not tested)

Other browsers should be fine.

You will need es6-promise polyfill on non-ES6 browsers in order to use AJAX functions.

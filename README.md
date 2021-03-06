# magicform
HTML form serialization and AJAX submitting library.

This library can serialize a form into JSON object, or deserialize a JSON object to fields of a form.

It also supports AJAX submitting of a form (need Promise support or es6-promise polyfill) and can enable cookies in PhoneGap/Cordova applications.

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

More field name conventions can be found in ```tests``` folder.

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
{ id: "1", key: "2", flag: "3", reason: "hello" }
```

### window.MagicForm.serializeSimple(formElem: HTMLFormElement) -> any
Serialize a form into a JSON object, but without nested structure.

### window.MagicForm.serializePlain(formElem: HTMLFormElement) -> String
Serialize a form into a query string.

### window.MagicForm.ajaxSubmit(formElem: HTMLFormElement, hooks: any, opts: any) -> Promise
AJAX submit a form immediately.

The object ```hooks``` may contains below functions:

##### beforeSerialize(formElem: HTMLFormElement) -> Boolean
This function will be called before form data is serialized.

Return a value any other than ```true``` will prevent the form from submitting.

##### beforeSubmit(data: any | FormData) -> Promise | Boolean
This function will be called before submitting the form. You can modify data before submitting.

Return a value any other than ```true``` or ```Promise.resolve(true)``` will prevent the form from submitting.

##### success(response: String, xhr: XMLHttpRequest)
This function will be called after the server responds with a 200. ```response``` is the response text, ```xhr``` is the request object.

##### failed(err: Error)
This function will be called when any error occured before submit, or the server responds with any code other than 200. ```err``` may be undefined.

The object ```opts``` may contains below options:

##### serializeAsJsonToParameter: String | Boolean
If this is set to ```false```, ```null``` or ```undefined```, it will be ignored; otherwise, it will submit a form like this (```serializeAsJsonToParameter: "__json__"```):

```
__json__=%7B%22id%22%3A%223%22%2C%22key%22%3A%226%22%2C%22flag%22%3A9%2C%22reason%22%3A%22world%22%7D
```

##### url: String
If the form doesn't contain an ```action``` property, then this will be used as target URL.

### window.MagicForm.ajaxify(formElem: HTMLFormElement, hooks: any, opts: any)
Make a form do AJAX submit when submit button is clicked.

The object ```hooks``` and ```opts``` is the same as ```hooks``` and ```opts``` in ```window.MagicForm.ajaxSubmit```.

### window.MagicForm.setConfigs(configs: any)
Set global configurations of serializing.

where ```configs``` can have:

```ignoreInvisibleFields```: Do not parse or serialize a field when it's invisble (determined by getComputedStyle), default ```false```

```ignoreHiddenFields```: Do not parse or serialize a field which has ```type="hidden"```, default ```false```

```uncheckedAsFalse```: Serialize a unchecked checkbox field as ```false```, or will ignore it, default ```true```

```denyCORSCredentials```: Set ```XMLHttpRequest.withCredentials = false```

```alternativeCookieHeaders```: See "Alternative Cookie Headers" section below.

## Alternative Cookie Headers (Needs server-side modification)
This option is to support local file based WebView applications like PhoneGap/Cordova applications which use cookies to do authentications etc.

Due to limitations of mobile WebViews, for example, on iOS, you can get the ```Set-Cookie``` header from ```XMLHttpRequest``` object, but the cookies are not persisted by WebView, nor be sent with requests;
On the other hand, on Android, you cannot get the ```Set-Cookie``` header, but the cookies are persisted and will be sent with requests.
```document.cookies``` will be ```null``` on both platforms.

One solution is to use ```window.localStorage```, which needs server to return cookies in some way other than ```Set-Cookie```.
You can make your server to return something like ```My-Set-Cookie``` headers with cookies to make client can read them through ```XMLHttpRequest.getResponseHeader```, and store them in something like ```localStorage```.
MagicForm can support this, through the ```alternativeCookieHeaders``` global configuration key.

```alternativeCookieHeaders``` contains following options:

```requestHeader```: If your server needs a custom header to enable cookies sent in another header, set this option to the header name.

```requestValue```: If your server needs a custom header to enable cookies sent in another header, set this option to the header value.

```cookie```: Specify the custom header name of standard header ```Cookie```

```setCookie```: Specify the custom header name of standard header ```Set-Cookie```

```storeTo```: Specify where to store the cookies. Options are ```window.document``` or ```window.localStorage```

If you want to read or modify saved cookies, you can use ```JSON.parse(localStorage.getItem("cookies"))``` or ```localStorage.setItem("cookies", JSON.stringify(obj))```.

## Browser compatibility
IE 9+ (< 9 may work, not tested)

Other browsers should be fine.

You will need es6-promise polyfill on non-ES6 browsers in order to use AJAX functions.

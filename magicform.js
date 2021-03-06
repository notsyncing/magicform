"use strict";

(function() {
    if (!window.MagicForm) {
        window.MagicForm = {};
    }

    var defaultConfigs = {
        ignoreInvisibleFields: false,
        ignoreHiddenFields: false,
        uncheckedAsFalse: true,
        denyCORSCredentials: false,
        alternativeCookieHeaders: {
            requestHeader: null,
            requestValue: null,
            cookie: null,
            setCookie: null,
            storeTo: null
        }
    };

    var defaultAjaxConfigs = {
        serializeAsJsonToParameter: false
    };

    function getInputElementValue(inputElem, uncheckedAsFalse)
    {
        var type = inputElem.getAttribute("type");

        if ((type === "button") || (type === "submit")) {
            return null;
        }

        if (window.MagicForm.configs.ignoreHiddenFields === undefined ? defaultConfigs.ignoreHiddenFields : window.MagicForm.configs.ignoreHiddenFields) {
            if (type === "hidden") {
                return null;
            }
        }

        if (window.MagicForm.configs.ignoreInvisibleFields === undefined ? defaultConfigs.ignoreInvisibleFields : window.MagicForm.configs.ignoreInvisibleFields) {
            if (window.getComputedStyle(inputElem).style.display === "none") {
                return null;
            }
        }

        if (inputElem instanceof HTMLInputElement) {
            if (type === "checkbox") {
                uncheckedAsFalse = uncheckedAsFalse || window.MagicForm.configs.uncheckedAsFalse;

                if (!(uncheckedAsFalse === undefined ? defaultConfigs.uncheckedAsFalse : uncheckedAsFalse)) {
                    if (!inputElem.checked) {
                        return null;
                    }
                }

                return inputElem.getAttribute("value") == null ? inputElem.checked : (inputElem.checked ? inputElem.value : null);
            } else if (type === "radio") {
                if (!inputElem.checked) {
                    return null;
                }

                return inputElem.value;
            } else if (type === "number") {
                return Number(inputElem.value);
            } else {
                return inputElem.value;
            }
        } else if (inputElem instanceof HTMLSelectElement) {
            if ((inputElem.options.length > 0) && (inputElem.selectedIndex >= 0)) {
                return inputElem.options[inputElem.selectedIndex].value;
            } else {
                return null;
            }
        } else if (inputElem instanceof HTMLTextAreaElement) {
            return inputElem.value;
        }

        return null;
    }

    function serializeInputElement(inputElem, obj)
    {
        var name = inputElem.getAttribute("name");

        if ((!name) || (name.length <= 0)) {
            return;
        }

        var value = getInputElementValue(inputElem);

        if ((value === null) || (value === undefined)) {
            return;
        }

        if (!obj) {
            obj = {};
        }

        var objRef = obj;
        var objRefParentArray = null;
        var objRefParentArrayIndex = 0;
        var lastNameStart = 0;
        var finalFieldName;
        var partName;
        var len;

        for (var i = 0; i < name.length; i++) {
            if (name[i] === ".") {
                partName = name.substring(lastNameStart, i).replace(/\[(.*?)\]/g, "");

                if ((!partName) || (partName.length <= 0)) {
                    continue;
                }

                if (!objRef[partName]) {
                    objRef[partName] = {};
                    objRef = objRef[partName];
                } else if (objRef[partName] instanceof Array) {
                    len = objRef[partName].push({});
                    objRef = objRef[partName][len - 1];
                } else {
                    objRef = objRef[partName];
                }

                objRefParentArray = null;
                lastNameStart = i + 1;
            } else if (name[i] === "]") {
                var indexBegin = i - 1;

                while (name[indexBegin] !== "[") {
                    indexBegin--;
                }

                var indexStr = name.substring(indexBegin + 1, i);
                partName = name.substring(lastNameStart, indexBegin);

                if (partName[0] === ".") {
                    partName = partName.substring(1);
                }

                if (!objRef[partName]) {
                    objRef[partName] = [];
                }

                if (indexStr === "") {
                    len = objRef[partName].push({});
                    objRefParentArray = objRef[partName];
                    objRefParentArrayIndex = len - 1;
                    objRef = objRef[partName][len - 1];
                } else {
                    var arrIndex = Number(indexStr);
                    objRefParentArray = objRef[partName];
                    objRefParentArrayIndex = arrIndex;

                    if (!objRef[partName][arrIndex]) {
                        objRef[partName][arrIndex] = {};
                    }

                    objRef = objRef[partName][arrIndex];
                }

                lastNameStart = i + 1;
            }
        }

        if (lastNameStart === 0) {
            finalFieldName = name;
        } else {
            finalFieldName = name.substring(lastNameStart);
        }

        while (finalFieldName[0] === ".") {
            finalFieldName = finalFieldName.substring(1);
        }

        if (objRefParentArray !== null) {
            if (name[name.length - 1] !== "]") {
                var lastArrayObjIndex = objRefParentArrayIndex - 1;
                var lastArrayObj = objRefParentArray[lastArrayObjIndex];

                while ((lastArrayObj === undefined) && (lastArrayObjIndex >= 0)) {
                    lastArrayObjIndex--;
                    lastArrayObj = objRefParentArray[lastArrayObjIndex];
                }

                if ((lastArrayObj !== undefined) && (lastArrayObj[finalFieldName] === undefined)) {
                    lastArrayObj[finalFieldName] = value;
                    objRefParentArray.splice(objRefParentArrayIndex, 1);
                } else {
                    objRef[finalFieldName] = value;
                }
            } else {
                objRefParentArray[objRefParentArrayIndex] = value;
            }
        } else {
            objRef[finalFieldName] = value;
        }

        return obj;
    }

    function setInputElementValue(inputElem, value)
    {
        var type = inputElem.getAttribute("type");

        if ((type === "button") || (type === "submit")) {
            return;
        }

        if (inputElem instanceof HTMLInputElement) {
            if (type === "file") {
                return;
            }

            if (type === "checkbox") {
                if (inputElem.getAttribute("value") != null) {
                    inputElem.checked = value == inputElem.getAttribute("value");
                } else {
                    inputElem.checked = value;
                }
            } else if (type === "radio") {
                inputElem.checked = (inputElem.value == value);
            } else if (type === "number") {
                inputElem.value = Number(value);
            } else {
                inputElem.value = value;
            }
        } else if (inputElem instanceof HTMLSelectElement) {
            for (var i = 0; i < inputElem.options.length; i++) {
                if (inputElem.options[i].value == value) {
                    inputElem.selectedIndex = i;
                    break;
                }
            }
        } else if (inputElem instanceof HTMLTextAreaElement) {
            inputElem.value = value;
        }
    }

    function parseInputElement(arrayCounters, inputElem, data)
    {
        var name = inputElem.getAttribute("name");
        var rawName = name;
        var type = inputElem.getAttribute("type");

        if ((!name) || (name.length <= 0)) {
            return;
        }

        var value;

        if (data instanceof Array) {
            var skip = 0;

            for (var i = 0; i < data.length; i++) {
                if (data[i].name === rawName) {
                    if (((type === "checkbox") || (type === "radio")) && (inputElem.value != null) && (inputElem.value != data[i].value)) {
                        skip++;
                        continue;
                    }

                    if (!arrayCounters[rawName]) {
                        arrayCounters[rawName] = 0;
                    } else if (skip < arrayCounters[rawName]) {
                        skip++;
                        continue;
                    }

                    value = data[i].value;
                    arrayCounters[rawName]++;

                    break;
                }
            }
        } else {
            var lastIndexName;

            while (name.indexOf("[]") >= 0) {
                var unindexedArrayEnd = name.indexOf("[]");

                if (arrayCounters[name] === undefined) {
                    arrayCounters[name] = -1;
                }

                lastIndexName = name;
                arrayCounters[name]++;
                name = name.substring(0, unindexedArrayEnd) + "[" +
                    arrayCounters[name] + "]" + name.substring(unindexedArrayEnd + 2);
            }

            var split = ".";

            if (name.indexOf("[") === 0) {
                split = "";
            }

            value = (new Function("data", "return data" + split + name + ";"))(data);

            if (((type === "checkbox") || (type === "radio")) && (inputElem.value != null) && (value != inputElem.value)) {
                arrayCounters[lastIndexName]--;
            }
        }

        setInputElementValue(inputElem, value);
    }

    window.MagicForm.configs = defaultConfigs;

    window.MagicForm.setConfigs = function (configs) {
        window.MagicForm.configs = configs || defaultConfigs;
    };

    window.MagicForm.parse = function (formElem, data) {
        var inputElems = formElem.querySelectorAll("input, select, textarea");
        var arrayCounters = {};

        for (var i = 0; i < inputElems.length; i++) {
            parseInputElement(arrayCounters, inputElems.item(i), data);
        }
    };

    window.MagicForm.serialize = function (formElem) {
        var obj = {};
        var inputElems = formElem.querySelectorAll("input, select, textarea");

        for (var i = 0; i < inputElems.length; i++) {
            serializeInputElement(inputElems.item(i), obj);
        }

        return obj;
    };

    function serializeInputElementSimple(inputElem, uncheckedAsFalse)
    {
        var name = inputElem.getAttribute("name");

        if ((!name) || (name.length <= 0)) {
            return;
        }

        var value = getInputElementValue(inputElem, uncheckedAsFalse);

        if ((value === null) || (value === undefined)) {
            return;
        }

        return { name: name, value: value };
    }

    window.MagicForm.serializePlain = function (formElem) {
        var pairs = [];
        var inputElems = formElem.querySelectorAll("input, select, textarea");

        for (var i = 0; i < inputElems.length; i++) {
            var p = serializeInputElementSimple(inputElems.item(i));

            if (!p) {
                continue;
            }

            var s = encodeURIComponent(p.name) + "=" + encodeURIComponent(p.value);
            pairs.push(s);
        }

        return pairs.join("&");
    };

    window.MagicForm.serializeSimple = function (formElem, uncheckedAsFalse) {
        var arr = [];
        var inputElems = formElem.querySelectorAll("input, select, textarea");

        for (var i = 0; i < inputElems.length; i++) {
            var p = serializeInputElementSimple(inputElems.item(i), uncheckedAsFalse);

            if (!p) {
                continue;
            }

            arr.push(p);
        }

        return arr;
    };

    function simpleObjectToQueryString(obj)
    {
        var l = [];

        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            if (obj[key] === undefined) {
                continue;
            }

            if (obj[key] instanceof Array) {
                for (var i = 0; i < obj[key].length; i++) {
                    l.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key][i]));
                }
            } else {
                l.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
            }
        }

        return l.join("&");
    }

    function simpleArrayToQueryString(arr)
    {
        var l = [];

        for (var i = 0; i < arr.length; i++) {
            l.push(encodeURIComponent(arr[i].name) + "=" + encodeURIComponent(arr[i].value));
        }

        return l.join("&");
    }

    function processReceivedAlternativeCookieHeaders(xhr)
    {
        var ch = window.MagicForm.configs.alternativeCookieHeaders;

        if ((!ch) || (!ch.storeTo) || (!ch.setCookie)) {
            return;
        }

        var headers = xhr.getAllResponseHeaders();

        if (!headers) {
            return;
        }

        headers = headers.split("\r\n");
        var setCookieHeader;
        var setCookieStart = ch.setCookie + ": ";

        for (var i = 0; i < headers.length; i++) {
            if (headers[i].toLowerCase().indexOf(setCookieStart.toLowerCase()) === 0) {
                setCookieHeader = headers[i].substring(setCookieStart.length);
                break;
            }
        }

        if (!setCookieHeader) {
            return;
        }

        var setCookieHeaders = [];
        var l = setCookieHeader.split(", ");

        for (var i = 0; i < l.length; i++) {
            if ((i > 0) && (l[i].indexOf("=") < 0)) {
                setCookieHeaders[setCookieHeaders.length - 1] += ", " + l[i];
            } else {
                setCookieHeaders.push(l[i]);
            }
        }

        if (ch.storeTo === window.document) {
            for (var i = 0; i < setCookieHeaders.length; i++) {
                document.cookie = setCookieHeaders[i];
            }
        } else if (ch.storeTo === window.localStorage) {
            var cookies = JSON.parse(localStorage.getItem("cookies") || "{}");

            for (var i = 0; i < setCookieHeaders.length; i++) {
                var cl = setCookieHeaders[i].split("; ");
                var cookieData = {};

                for (var j = 0; j < cl.length; j++) {
                    var kv = cl[j].split("=");

                    if (j === 0) {
                        cookieData.name = kv[0];
                        cookieData.value = kv[1];
                    } else {
                        cookieData[kv[0]] = kv[1];
                    }
                }

                cookies[cookieData.name] = cookieData.value;

                if (cookieData["max-age"]) {
                    if (cookieData["max-age"] == 0) {
                        delete cookies[cookieData.name];
                    } else if (cookieData["max-age"] < 0) {
                        // TODO: Implement temporary cookie!
                    }
                } else if (cookieData.expires) {
                    var expireDate = Date.parse(cookieData.expires);
                    var nowDate = new Date();

                    if (expireDate < nowDate) {
                        delete cookies[cookieData.name];
                    }
                }
            }

            localStorage.setItem("cookies", JSON.stringify(cookies));
        }
    }

    function processSendAlternativeCookieHeaders(xhr)
    {
        var ch = window.MagicForm.configs.alternativeCookieHeaders;

        if ((!ch) || (!ch.storeTo) || (!ch.cookie)) {
            return;
        }

        if (ch.requestHeader) {
            xhr.setRequestHeader(ch.requestHeader, ch.requestValue);
        }

        if (ch.storeTo === window.document) {
            xhr.setRequestHeader(ch.cookie, document.cookie);
        } else if (ch.storeTo === window.localStorage) {
            var cookies = JSON.parse(localStorage.getItem("cookies") || "{}");
            var cookieList = [];

            for (var key in cookies) {
                if (!cookies.hasOwnProperty(key)) {
                    continue;
                }

                cookieList.push(key + "=" + cookies[key]);
            }

            if (cookieList.length > 0) {
                xhr.setRequestHeader(ch.cookie, cookieList.join("; "));
            }
        }
    }

    function ajax(method, url, data, xhrFields)
    {
        return new Promise(function (resolve, reject) {
            try {
                if (method.toLocaleLowerCase() !== "post") {
                    if (data != null) {
                        url += "?" + ((data instanceof Array) ? simpleArrayToQueryString(data) : simpleObjectToQueryString(data));
                        data = null;
                    }
                } else if (typeof data === "string") {
                    data = data;
                } else if ((window.FormData) && (!(data instanceof FormData))) {
                    data = (data instanceof Array) ? simpleArrayToQueryString(data) : simpleObjectToQueryString(data);
                }

                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);

                if (!window.MagicForm.configs.denyCORSCredentials) {
                    xhr.withCredentials = true;
                }

                if (xhrFields) {
                    for (var key in xhrFields) {
                        if (!xhrFields.hasOwnProperty(key)) {
                            continue;
                        }

                        xhr[key] = xhrFields[key];
                    }
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === (xhr.DONE || 4)) {
                        if (xhr.status === 200) {
                            processReceivedAlternativeCookieHeaders(xhr);

                            var data = xhr.responseText;

                            if (xhr.getResponseHeader("Content-Type") == "application/json") {
                                data = JSON.parse(data);
                            }

                            return resolve({ response: data, xhr: xhr });
                        } else {
                            return reject(new Error(xhr.status + ": " + xhr.statusText + "\n > when accessing " + url +
                                " with " + method + " data " + JSON.stringify(data) + " xhrFields " +
                                JSON.stringify(xhrFields)));
                        }
                    }
                };

                processSendAlternativeCookieHeaders(xhr);

                if (data) {
                    xhr.send(data);
                } else {
                    xhr.send();
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    function iframeUpload(formElem, hooks)
    {
        return new Promise(function (resolve, reject) {
            var resolved = false;
            var iframeId = "magicform-upload-" + Math.random().toString().replace(".", "").replace("-", "");
            var iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.id = iframeId;

            var done = function () {
                resolved = true;
                resolve(iframe.contentWindow.document.body.innerHTML);
            };

            if (iframe.attachEvent) {
                iframe.attachEvent("onload", done);
            } else {
                iframe.onload = done;
            }

            var p;

            if (hooks.beforeSubmit) {
                var data = window.MagicForm.serialize(formElem);

                var result = hooks.beforeSubmit(data);

                if (result === false) {
                    return reject();
                } else if (result instanceof Promise) {
                    p = result;
                }
            }

            formElem.target = iframeId;

            if (p) {
                p.then(function (result) {
                    if (!result) {
                        reject();
                    } else {
                        if (hooks.submit) {
                            return hooks.submit(formElem, method, url, data);
                        } else {
                            formElem.submit();
                        }
                    }
                });
            } else {
                if (hooks.submit) {
                    return hooks.submit(formElem, method, url, data);
                } else {
                    formElem.submit();
                }
            }
        });
    }

    window.MagicForm.ajaxSubmit = function (formElem, hooks, opts) {
        var method = formElem.method || "get";
        var url = formElem.action || opts.url;
        var data;
        var dataIsMultipart = false;

        hooks = hooks || {};
        opts = opts || defaultAjaxConfigs;

        if (typeof hooks.beforeSerialize === "function") {
            if (hooks.beforeSerialize(formElem) === false) {
                return Promise.reject(false);
            }
        }

        var serializeData = function () {
            if (opts.serializeAsJsonToParameter) {
                var o = window.MagicForm.serialize(formElem);
                return opts.serializeAsJsonToParameter + "=" + encodeURIComponent(JSON.stringify(o));
            }

            return window.MagicForm.serializeSimple(formElem, true);
        };

        data = serializeData();

        if (method.toLowerCase() === "post") {
            if (formElem.enctype === "multipart/form-data") {
                dataIsMultipart = true;
            }
        }

        var p;

        if (hooks.beforeSubmit) {
            var result = hooks.beforeSubmit(data);

            if (result === false) {
                return Promise.reject(false);
            } else if (result instanceof Promise) {
                p = result;
            } else {
                p = Promise.resolve(true);
            }
        } else {
            p = Promise.resolve(true);
        }

        var oldData;

        return p.then(function (result) {
            if (!result) {
                return Promise.reject();
            } else {
                if (dataIsMultipart) {
                    oldData = serializeData();
                    MagicForm.parse(formElem, data);

                    if (window.FormData) {
                        data = new FormData(formElem);
                        MagicForm.parse(formElem, oldData);
                    } else {
                        return iframeUpload(formElem, hooks);
                    }
                }

                if (hooks.submit) {
                    return hooks.submit(formElem, method, url, data);
                } else {
                    return ajax(method, url, data);
                }
            }
        });
    };

    function addEventListener(elem, eventName, handler)
    {
        if (elem.addEventListener) {
            return elem.addEventListener(eventName, handler);
        } else if (elem.attachEvent) {
            return elem.attachEvent("on" + eventName, handler);
        }
    }

    window.MagicForm.ajaxify = function (formElem, hooks, opts) {
        addEventListener(formElem, "submit", function (event) {
            event = event || window.event;
            event.preventDefault();

            hooks = hooks || {};
            opts = opts || defaultAjaxConfigs;

            window.MagicForm.ajaxSubmit(formElem, hooks, opts)
                .then(function (data) {
                    if (hooks.success) {
                        hooks.success(data.response, data.xhr);
                    }
                })
                .catch(function (error) {
                    if (error === false) {
                        return;
                    }

                    if (hooks.failed) {
                        hooks.failed(error);
                    }
                });

            return false;
        });
    };

    window.MagicForm.ajax = function (opts) {
        var method = opts.method || "get";
        var url = opts.url;
        var xhrFields = opts.xhrFields || {};
        var data = opts.data;

        return ajax(method, url, data, xhrFields);
    };
})();

(function () {
    if (!window.Manifold) {
        window.Manifold = {
            serverUrl: "http://localhost:8080/manifold/gateway",
            namespace: null
        };
    }

    function simpleArrayToSimpleObject(arr) {
        if (!arr) {
            return {};
        }

        var o = {};

        for (var i = 0; i < arr.length; i++) {
            o[arr[i].name] = arr[i].value;
        }

        return o;
    }

    window.Manifold.sceneUrl = function (method, name, parameters, sessionIdentifier, namespace) {
        var url = window.Manifold.serverUrl + "/" + name;
        var payload = "";

        if (parameters) {
            if (parameters instanceof FormData) {
                payload = parameters;
            } else {
                if (parameters instanceof Array) {
                    parameters = simpleArrayToSimpleObject(parameters);
                }

                payload = "json=" + encodeURIComponent(JSON.stringify(parameters));
            }
        }

        if (sessionIdentifier) {
            if (payload instanceof FormData) {
                payload.append("access_token", sessionIdentifier);
            } else {
                if (payload !== "") {
                    payload += "&";
                }

                payload += "access_token=" + sessionIdentifier;
            }
        }

        namespace = namespace || Manifold.namespace;

        if (namespace) {
            if (payload instanceof FormData) {
                payload.append("namespace", namespace);
            } else {
                if (payload !== "") {
                    payload += "&";
                }

                payload += "namespace=" + namespace;
            }
        }

        if (payload) {
            if (method === "get") {
                url += "?" + payload;
                payload = null;
            }
        }

        return {
            url: url,
            payload: payload
        };
    };

    window.Manifold.getSceneUrl = function (method, name, parameters, sessionIdentifier, namespace) {
        var o = window.Manifold.sceneUrl(method, name, parameters, sessionIdentifier, namespace);
        return o.url;
    };

    window.Manifold.callScene = function (method, name, parameters, sessionIdentifier, namespace) {
        var o = window.Manifold.sceneUrl(method, name, parameters, sessionIdentifier, namespace);

        return window.MagicForm.ajax({
            method: method,
            url: o.url,
            data: o.payload
        }).then(function (r) { return r.response; });
    };

    function _serializeForm(form, customWrapper) {
        var json = window.MagicForm.serialize(form);

        if (form.enctype === "multipart/form-data") {
            var formData = new FormData();
            var inputs = form.querySelectorAll("input");

            for (var i = 0; i < inputs.length; i++) {
                var e = inputs[i];

                if (!(e instanceof HTMLInputElement)) {
                    continue;
                }

                if (e.type !== "file") {
                    continue;
                }

                for (var j = 0; j < e.files.length; j++) {
                    formData.append(e.name, e.files[j]);

                    if (json[e.name]) {
                        delete json[e.name];
                    }
                }
            }

            if (customWrapper) {
                json = customWrapper(json);
            }

            formData.append("json", JSON.stringify(json));

            return formData;
        } else {
            if (customWrapper) {
                json = customWrapper(json);
            }
        }

        return json;
    }

    window.Manifold.getScene = function (name, parameters, sessionIdentifier, namespace) {
        if (parameters instanceof Element) {
            parameters = _serializeForm(parameters);
        }

        return window.Manifold.callScene("get", name, parameters, sessionIdentifier, namespace);
    };

    window.Manifold.postScene = function (name, parameters, sessionIdentifier, namespace) {
        if (parameters instanceof Element) {
            parameters = _serializeForm(parameters);
        }

        return window.Manifold.callScene("post", name, parameters, sessionIdentifier, namespace);
    };

    window.Manifold.performDramaAction = function (name, parameters, sessionIdentifier, namespace) {
        if (parameters instanceof Element) {
            parameters = _serializeForm(parameters, function (o) {
                var d = JSON.parse(JSON.stringify(o));

                return {
                    action: name,
                    parameters: d
                };
            });
        } else {
            parameters = {
                action: name,
                parameters: parameters
            }
        }

        return window.Manifold.postScene("manifold.drama.entry", parameters, sessionIdentifier, namespace);
    }
})();

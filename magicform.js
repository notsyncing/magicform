(function() {
    "use strict";

    if (!window.MagicForm) {
        window.MagicForm = {};
    }

    var defaultConfigs = {
        ignoreInvisibleFields: false,
        ignoreHiddenFields: false,
        uncheckedAsFalse: true
    };
    
    var defaultAjaxConfigs = {
        serializeAsJsonToParameter: false
    };

    function getInputElementValue(inputElem)
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
                if (!(window.MagicForm.configs.uncheckedAsFalse === undefined ? defaultConfigs.uncheckedAsFalse : window.MagicForm.configs.uncheckedAsFalse)) {
                    if (!inputElem.checked) {
                        return null;
                    }
                }

                return inputElem.checked;
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
            return inputElem.options[inputElem.selectedIndex].value;
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
            if (type === "checkbox") {
                inputElem.checked = value;
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

        if ((!name) || (name.length <= 0)) {
            return;
        }

        var value;

        while (name.indexOf("[]") >= 0) {
            var unindexedArrayEnd = name.indexOf("[]");

            if (arrayCounters[name] === undefined) {
                arrayCounters[name] = -1;
            }

            arrayCounters[name]++;
            name = name.substring(0, unindexedArrayEnd) + "[" + arrayCounters[name] + "]" + name.substring(unindexedArrayEnd + 2);
        }

        value = (new Function("data", "return data." + name + ";"))(data);
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

    function serializeInputElementSimple(inputElem)
    {
        var name = inputElem.getAttribute("name");

        if ((!name) || (name.length <= 0)) {
            return;
        }

        var value = getInputElementValue(inputElem);

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

    window.MagicForm.serializeSimple = function (formElem) {
        var obj = {};
        var inputElems = formElem.querySelectorAll("input, select, textarea");

        for (var i = 0; i < inputElems.length; i++) {
            var p = serializeInputElementSimple(inputElems.item(i));
            
            if (!p) {
                continue;
            }
            
            obj[p.name] = p.value;
        }

        return obj;
    };

    function simpleObjectToQueryString(obj)
    {
        var l = [];

        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            l.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
        }

        return l.join("&");
    }

    function ajax(method, url, data)
    {
        return new Promise(function (resolve, reject) {
            try {
                var xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === (xhr.DONE || 4)) {
                        if (xhr.status === 200) {
                            return resolve(xhr.responseText);
                        } else {
                            return reject(new Error(xhr.status + ": " + xhr.statusText));
                        }
                    }
                };

                if (method.toLocaleLowerCase() !== "post") {
                    url += "?" + simpleObjectToQueryString(data);
                    data = null;
                } else if (typeof data === "string") {
                    data = data;
                } else if ((window.FormData) && (!(data instanceof FormData))) {
                    data = simpleObjectToQueryString(data);
                }

                xhr.open(method, url, true);

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
                        formElem.submit();
                    }
                });
            } else {
                formElem.submit();
            }
        });
    }

    window.MagicForm.ajaxSubmit = function (formElem, hooks, opts) {
        var method = formElem.method || "get";
        var url = formElem.action;
        var data;

        hooks = hooks || {};
        opts = opts || defaultAjaxConfigs;
        
        var serializeData = function () {
            if (opts.serializeAsJsonToParameter) {
                var o = window.MagicForm.serialize(formElem);
                return opts.serializeAsJsonToParameter + "=" + encodeURIComponent(JSON.stringify(o));
            }
            
            return window.MagicForm.serializeSimple(formElem);
        };

        if (method.toLowerCase() === "post") {
            if (formElem.enctype === "multipart/form-data") {
                if (window.FormData) {
                    data = new FormData(formElem);
                } else {
                    return iframeUpload(formElem, hooks);
                }
            } else {
                data = serializeData();
            }
        } else {
            data = serializeData();
        }
        
        var p;

        if (hooks.beforeSubmit) {
            var result = hooks.beforeSubmit(data);
            
            if (result === false) {
                return Promise.reject();
            } else if (result instanceof Promise) {
                p = result;
            }
        }

        if (p) {
            return p.then(function (result) {
                if (!result) {
                    return Promise.reject();
                } else {
                    return ajax(method, url, data);
                }
            });
        } else {
            return ajax(method, url, data);
        }
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
                .then(function (response) {
                    if (hooks.success) {
                        hooks.success(response);
                    }
                })
                .catch(function (error) {
                    if (hooks.failed) {
                        hooks.failed(error);
                    }
                });

            return false;
        });
    };
})();

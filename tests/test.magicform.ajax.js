var testGetForm = document.getElementById("testGetForm");
var testGetForm2 = document.getElementById("testGetForm2");
var testGetForm3 = document.getElementById("testGetForm3");
var testPostForm = document.getElementById("testPostForm");

describe("MagicForm", function () {
    beforeEach(function () {
        MagicForm.setConfigs();

        localStorage.removeItem("cookies");

        this.currPath = window.location.href;
        this.currPath = this.currPath.substring(0, this.currPath.lastIndexOf("/"));

        this.server = sinon.fakeServer.create();

        var testGetFormResp = "world";
        this.server.respondWith(new RegExp("^" + testGetForm.action.replace("file://", "") + "([?/](.*?))*$"),
            testGetFormResp);

        var testGetFormWithCookiesResp = "world2";
        this.server.respondWith(new RegExp("^" + testGetForm2.action.replace("file://", "") + "([?/](.*?))*$"),
            [ 200, { "Cowherd-Set-Cookie": "a=1" }, testGetFormWithCookiesResp ]);

        var testGetFormWithExpiredCookiesResp = "world3";
        this.server.respondWith(new RegExp("^" + testGetForm3.action.replace("file://", "") + "([?/](.*?))*$"),
            [ 200, { "Cowherd-Set-Cookie": "a=1; max-age=0" }, testGetFormWithExpiredCookiesResp ]);

        this.requests = this.server.requests;
    });

    afterEach(function () {
        this.server.restore();

        MagicForm.setConfigs();

        localStorage.removeItem("cookies");
    });

    describe("#ajaxSubmit", function () {
        it("should correctly submit a simple GET form with AJAX", function () {
            MagicForm.ajaxSubmit(testGetForm);

            this.requests.length.should.equal(1);
            this.requests[0].url.should.equal(this.currPath + "/testPath?id=1&key=2&flag=5&reason=hello");
            this.requests[0].method.should.equal("get");
            (!!this.requests[0].requestBody).should.be.false;
        });

        it("should correctly submit a simple POST form with AJAX", function () {
            MagicForm.ajaxSubmit(testPostForm);

            this.requests.length.should.equal(1);
            this.requests[0].url.should.equal(this.currPath + "/testPath");
            this.requests[0].method.should.equal("post");
            this.requests[0].requestBody.should.equal("id=3&key=6&flag=9&reason=world");
        });

        it("should correctly serialize and submit a simple POST form with AJAX", function () {
            MagicForm.ajaxSubmit(testPostForm, null, { serializeAsJsonToParameter: "__json__" });

            this.requests.length.should.equal(1);
            this.requests[0].url.should.equal(this.currPath + "/testPath");
            this.requests[0].method.should.equal("post");
            this.requests[0].requestBody.should.equal("__json__=%7B%22id%22%3A%223%22%2C%22key%22%3A%226%22%2C%22flag%22%3A9%2C%22reason%22%3A%22world%22%7D");
        });

        it("should correctly trigger all hooks during AJAX", function () {
            var d;
            var f;

            MagicForm.ajaxSubmit(testGetForm, {
                beforeSerialize: function (formElem) {
                    f = formElem;
                },
                beforeSubmit: function (data) {
                    d = data;
                }
            });

            (!!d).should.be.true;
            d[0].name.should.equal("id");
            d[0].value.should.equal("1");
            d[1].name.should.equal("key");
            d[1].value.should.equal("2");
            d[2].name.should.equal("flag");
            d[2].value.should.equal(5);
            d[3].name.should.equal("reason");
            d[3].value.should.equal("hello");
            f.should.equal(testGetForm);

            this.requests.length.should.equal(1);
            this.requests[0].url.should.equal(this.currPath + "/testPath?id=1&key=2&flag=5&reason=hello");
            this.requests[0].method.should.equal("get");
            (!!this.requests[0].requestBody).should.be.false;
        });

        it("should correctly save cookies in alternative cookie header", function (done) {
            MagicForm.configs.alternativeCookieHeaders.setCookie = "Cowherd-Set-Cookie";
            MagicForm.configs.alternativeCookieHeaders.storeTo = window.localStorage;

            MagicForm.ajaxSubmit(testGetForm2)
                .then(function (resp) {
                    resp.should.equal("world2");

                    var cookies = JSON.parse(localStorage.getItem("cookies"));
                    (!!cookies).should.be.true;
                    cookies.a.should.equal("1");

                    done();
                })
                .catch(function (err) {
                    done(err);
                });

            this.server.respond();
        });

        it("should correctly remove cookies in alternative cookie header with expired date", function (done) {
            localStorage.setItem("cookies", JSON.stringify({ a: 1 }));

            MagicForm.configs.alternativeCookieHeaders.setCookie = "Cowherd-Set-Cookie";
            MagicForm.configs.alternativeCookieHeaders.storeTo = window.localStorage;

            MagicForm.ajaxSubmit(testGetForm3)
                .then(function (resp) {
                    resp.should.equal("world3");

                    var cookies = JSON.parse(localStorage.getItem("cookies"));
                    (!!cookies).should.be.true;
                    cookies.should.not.have.property("a");

                    done();
                })
                .catch(function (err) {
                    done(err);
                });

            this.server.respond();
        });

        it("should correctly send cookies saved in localStorage with alternative cookie header", function () {
            localStorage.setItem("cookies", JSON.stringify({ a: 1 }));

            MagicForm.configs.alternativeCookieHeaders.cookie = "Cowherd-Cookie";
            MagicForm.configs.alternativeCookieHeaders.storeTo = window.localStorage;
            MagicForm.ajaxSubmit(testPostForm, null, { serializeAsJsonToParameter: "__json__" });

            this.requests.length.should.equal(1);
            this.requests[0].requestHeaders.should.have.property("Cowherd-Cookie", "a=1");
        });
    });

    describe("#ajaxify", function () {
        it("should correctly trigger all hooks during AJAX submit", function (done) {
            var d;
            var f;
            var r;
            var _this = this;

            MagicForm.ajaxify(testGetForm, {
                beforeSerialize: function (formElem) {
                    f = formElem;
                },
                beforeSubmit: function (data) {
                    d = data;
                },
                success: function (response) {
                    r = response;

                    (!!d).should.be.true;
                    d[0].name.should.equal("id");
                    d[0].value.should.equal("1");
                    d[1].name.should.equal("key");
                    d[1].value.should.equal("2");
                    d[2].name.should.equal("flag");
                    d[2].value.should.equal(5);
                    d[3].name.should.equal("reason");
                    d[3].value.should.equal("hello");
                    f.should.equal(testGetForm);
                    r.should.equal("world");

                    _this.requests.length.should.equal(1);
                    _this.requests[0].url.should.equal(_this.currPath + "/testPath?id=1&key=2&flag=5&reason=hello");
                    _this.requests[0].method.should.equal("get");
                    (!!_this.requests[0].requestBody).should.be.false;

                    done();
                }
            });

            testGetForm.querySelector(".f-submit").click();

            this.server.respond();
        });
    });
});

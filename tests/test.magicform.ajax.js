var testGetForm = document.getElementById("testGetForm");
var testPostForm = document.getElementById("testPostForm");

describe("MagicForm", function () {
    beforeEach(function () {
        MagicForm.setConfigs();
        
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.requests = [];
        this.xhr.onCreate = function (xhr) {
            this.requests.push(xhr);
        }.bind(this);
        
        this.currPath = window.location.href;
        this.currPath = this.currPath.substring(0, this.currPath.lastIndexOf("/"));
    });
    
    afterEach(function () {
        this.requests = [];
        this.xhr.restore();
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
    });
});
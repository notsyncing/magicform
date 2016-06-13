var testSingleFieldForm = document.getElementById("testSingleFieldForm");
var testMultipleFieldsForm = document.getElementById("testMultipleFieldsForm");
var testCheckboxFieldsForm = document.getElementById("testCheckboxFieldsForm");
var testRadioFieldsForm = document.getElementById("testRadioFieldsForm");
var testDeepObjectFieldsForm = document.getElementById("testDeepObjectFieldsForm");
var testArrayFieldsForm = document.getElementById("testArrayFieldsForm");
var testComplexFieldsForm = document.getElementById("testComplexFieldsForm");

describe("MagicForm", function () {
    beforeEach(function () {
        MagicForm.setConfigs();
    });
    
    describe("#serialize", function () {
        it("should generate one field for single field form", function () {
            var obj = MagicForm.serialize(testSingleFieldForm);
            obj.should.have.property("key", "2");
        });
        
        it("should generate multiple fields for multiple field form", function () {
            var obj = MagicForm.serialize(testMultipleFieldsForm);
            obj.should.have.property("id", "1");
            obj.should.have.property("key", "2");
            obj.should.have.property("flag", 5);
            obj.should.have.property("reason", "hello");
        });
        
        it("should generate boolean fields for multiple checkboxes form", function () {
            var obj = MagicForm.serialize(testCheckboxFieldsForm);
            obj.should.have.property("useFirst", true);
            obj.should.have.property("useSecond", true);
            obj.should.have.property("useThird", false);
            obj.should.not.have.property("useFourth");
            obj.should.have.property("useFifth", "5");
        });
        
        it("should not generate fields for unchecked checkboxes when configured", function () {
            MagicForm.setConfigs({ uncheckedAsFalse: false });
            var obj = MagicForm.serialize(testCheckboxFieldsForm);
            obj.should.have.property("useFirst", true);
            obj.should.have.property("useSecond", true);
            obj.should.not.have.property("useThird", false);
        });
        
        it("should generate only selected value fields for multiple radio buttons form", function () {
            var obj = MagicForm.serialize(testRadioFieldsForm);
            obj.should.have.property("use", "first");
            obj.should.not.have.property("use", "second");
            obj.should.have.property("for", "2");
            obj.should.not.have.property("for", "1");
        });
        
        it("should generate correct object for nested named fields form", function () {
            var obj = MagicForm.serialize(testDeepObjectFieldsForm);
            obj.should.have.property("field1", "a");
            
            obj.should.have.property("field2");
            obj.field2.should.have.property("inner", "b");
            
            obj.should.have.property("field3");
            obj.field3.should.have.property("inner");
            obj.field3.inner.should.have.property("body", "c");
        });
        
        it("should generate correct array for array named fields form", function () {
            var obj = MagicForm.serialize(testArrayFieldsForm);
            obj.should.have.property("arr1").with.lengthOf(3);
            obj.arr1[0].should.be.exactly("a");
            obj.arr1[1].should.be.exactly("b");
            obj.arr1[2].should.be.exactly("c");
            
            obj.should.have.property("arr2").with.lengthOf(5);
            should.not.exist(obj.arr2[0]);
            should.not.exist(obj.arr2[1]);
            obj.arr2[2].should.be.exactly("d");
            should.not.exist(obj.arr2[3]);
            obj.arr2[4].should.be.exactly("e");
        });
        
        it("should generate correct object for complex nested fields form", function () {
            var obj = MagicForm.serialize(testComplexFieldsForm);
            obj.should.have.property("arr1").with.lengthOf(3);
            obj.arr1[0].should.have.property("name", "a");
            obj.arr1[0].should.have.property("value", "1");
            obj.arr1[1].should.have.property("name", "b");
            obj.arr1[1].should.have.property("value", "2");
            obj.arr1[2].should.have.property("name", "c");
            obj.arr1[2].should.have.property("value", "3");
            
            obj.should.have.property("arr2").with.lengthOf(5);
            should.not.exist(obj.arr2[0]);
            should.not.exist(obj.arr2[1]);
            obj.arr2[2].should.have.property("name", "d");
            obj.arr2[2].should.have.property("value", "4");
            should.not.exist(obj.arr2[3]);
            obj.arr2[4].should.have.property("name", "e");
            obj.arr2[4].should.have.property("value", "5");
            
            obj.should.have.property("deep");
            obj.deep.should.have.property("obj").with.lengthOf(1);
            obj.deep.obj[0].should.have.property("arr").with.lengthOf(1);
            obj.deep.obj[0].arr[0].should.have.property("flag", "6");
        });
    });
    
    describe("#serializePlain", function () {
        it("should generate one field for single field form", function () {
            var str = MagicForm.serializePlain(testSingleFieldForm);
            str.should.be.exactly("key=2");
        });
        
        it("should generate multiple fields for multiple field form", function () {
            var str = MagicForm.serializePlain(testMultipleFieldsForm);
            str.should.be.exactly("id=1&key=2&flag=5&reason=hello");
        });
    });
});
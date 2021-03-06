var testSingleFieldForm = document.getElementById("testSingleFieldForm");
var testMultipleFieldsForm = document.getElementById("testMultipleFieldsForm");
var testCheckboxFieldsForm = document.getElementById("testCheckboxFieldsForm");
var testCheckboxFieldsForm2 = document.getElementById("testCheckboxFieldsForm2");
var testRadioFieldsForm = document.getElementById("testRadioFieldsForm");
var testDeepObjectFieldsForm = document.getElementById("testDeepObjectFieldsForm");
var testArrayFieldsForm = document.getElementById("testArrayFieldsForm");
var testDeepArrayFieldsForm = document.getElementById("testDeepArrayFieldsForm");
var testComplexFieldsForm = document.getElementById("testComplexFieldsForm");

describe("MagicForm", function () {
    beforeEach(function () {
        var forms = document.getElementsByTagName("form");

        for (var i = 0; i < forms.length; i++) {
            forms[i].reset();
        }

        MagicForm.setConfigs();
    });

    describe("#parse", function () {
        it("should put a correct value to a single field form", function () {
            MagicForm.parse(testSingleFieldForm, { key: 3 });
            testSingleFieldForm.querySelector(".f-key").value.should.be.exactly("3");
        });

        it("should put correct values to a simple multiple fields form", function () {
            MagicForm.parse(testMultipleFieldsForm, {
                id: 2,
                key: "3",
                flag: "7",
                reason: "invalid"
            });

            testMultipleFieldsForm.querySelector(".f-id").value.should.be.exactly("2");
            testMultipleFieldsForm.querySelector(".f-key").value.should.be.exactly("3");
            testMultipleFieldsForm.querySelector(".f-flag").value.should.be.exactly("7");
            testMultipleFieldsForm.querySelector(".f-reason").value.should.be.exactly("invalid");
        });

        it("should check correct checbox in a multiple checkboxes form", function () {
            MagicForm.parse(testCheckboxFieldsForm, {
                useFirst: false,
                useSecond: false,
                useThird: true,
                useFourth: "4",
                useFifth: "2"
            });

            testCheckboxFieldsForm.querySelector(".f-useFirst").checked.should.be.exactly(false);
            testCheckboxFieldsForm.querySelector(".f-useSecond").checked.should.be.exactly(false);
            testCheckboxFieldsForm.querySelector(".f-useThird").checked.should.be.exactly(true);
            testCheckboxFieldsForm.querySelector(".f-useFourth").checked.should.be.exactly(true);
            testCheckboxFieldsForm.querySelector(".f-useFifth").checked.should.be.exactly(false);
        });

        it("should check correct valued checkboxes with an array of data", function () {
            MagicForm.parse(testCheckboxFieldsForm2, {
                arr: [ "1", "3" ]
            });

            testCheckboxFieldsForm2.querySelector(".f-check1").checked.should.be.exactly(true);
            testCheckboxFieldsForm2.querySelector(".f-check2").checked.should.be.exactly(false);
            testCheckboxFieldsForm2.querySelector(".f-check3").checked.should.be.exactly(true);
        });

        it("should check correct valued checkboxes with simply serialized array data", function () {
            MagicForm.parse(testCheckboxFieldsForm2, [
                { name: "arr[]", value: 1 },
                { name: "arr[]", value: 3 }
            ]);

            testCheckboxFieldsForm2.querySelector(".f-check1").checked.should.be.exactly(true);
            testCheckboxFieldsForm2.querySelector(".f-check2").checked.should.be.exactly(false);
            testCheckboxFieldsForm2.querySelector(".f-check3").checked.should.be.exactly(true);
        });

        it("should check correct radio buttons in a multiple radio buttons form", function () {
            MagicForm.parse(testRadioFieldsForm, {
                use: "second",
                for: "1"
            });

            testRadioFieldsForm.querySelector(".f-useFirst").checked.should.be.exactly(false);
            testRadioFieldsForm.querySelector(".f-useFirst").value.should.be.exactly("first");
            testRadioFieldsForm.querySelector(".f-useSecond").checked.should.be.exactly(true);
            testRadioFieldsForm.querySelector(".f-useSecond").value.should.be.exactly("second");

            testRadioFieldsForm.querySelector(".f-forFirst").checked.should.be.exactly(true);
            testRadioFieldsForm.querySelector(".f-forFirst").value.should.be.exactly("1");
            testRadioFieldsForm.querySelector(".f-forSecond").checked.should.be.exactly(false);
            testRadioFieldsForm.querySelector(".f-forSecond").value.should.be.exactly("2");
        });

        it("should put correct values to a deep named form", function () {
            MagicForm.parse(testDeepObjectFieldsForm, {
                field1: "d",
                field2: {
                    inner: "e",
                },
                field3: {
                    inner: {
                        body: "f"
                    }
                }
            });

            testDeepObjectFieldsForm.querySelector(".f-field1").value.should.be.exactly("d");
            testDeepObjectFieldsForm.querySelector(".f-field2-inner").value.should.be.exactly("e");
            testDeepObjectFieldsForm.querySelector(".f-field3-inner-body").value.should.be.exactly("f");
        });

        it("should put correct values in an array to a deep named form", function () {
            MagicForm.parse(testDeepObjectFieldsForm, [
                {
                    name: "field1",
                    value: "d"
                },
                {
                    name: "field2.inner",
                    value: "e"
                },
                {
                    name: "field3.inner.body",
                    value: "f"
                }
            ]);

            testDeepObjectFieldsForm.querySelector(".f-field1").value.should.be.exactly("d");
            testDeepObjectFieldsForm.querySelector(".f-field2-inner").value.should.be.exactly("e");
            testDeepObjectFieldsForm.querySelector(".f-field3-inner-body").value.should.be.exactly("f");
        });

        it("should put correct values to an array fields form", function () {
            MagicForm.parse(testArrayFieldsForm, {
                arr1: [ "d", "e", "f" ],
                arr2: [ "g", "h", "i", "j", "k" ]
            });

            testArrayFieldsForm.querySelector(".f-arr1-0").value.should.be.exactly("d");
            testArrayFieldsForm.querySelector(".f-arr1-1").value.should.be.exactly("e");
            testArrayFieldsForm.querySelector(".f-arr1-2").value.should.be.exactly("f");

            testArrayFieldsForm.querySelector(".f-arr2-2").value.should.be.exactly("i");
            testArrayFieldsForm.querySelector(".f-arr2-4").value.should.be.exactly("k");
        });

        it("should put correct values in an array to a deep array fields form", function () {
            MagicForm.parse(testDeepArrayFieldsForm, [
                {
                    name: "arr[].name",
                    value: "d"
                },
                {
                    name: "arr[].value",
                    value: "4"
                },
                {
                    name: "arr[].name",
                    value: "e"
                },
                {
                    name: "arr[].value",
                    value: "5"
                },
                {
                    name: "arr[].name",
                    value: "f"
                },
                {
                    name: "arr[].value",
                    value: "6"
                }
            ]);

            testDeepArrayFieldsForm.querySelector(".f-arr-0-name").value.should.be.exactly("d");
            testDeepArrayFieldsForm.querySelector(".f-arr-0-value").value.should.be.exactly("4");
            testDeepArrayFieldsForm.querySelector(".f-arr-1-name").value.should.be.exactly("e");
            testDeepArrayFieldsForm.querySelector(".f-arr-1-value").value.should.be.exactly("5");
            testDeepArrayFieldsForm.querySelector(".f-arr-2-name").value.should.be.exactly("f");
            testDeepArrayFieldsForm.querySelector(".f-arr-2-value").value.should.be.exactly("6");
        });

        it("should put correct values to a complex fields form", function () {
            MagicForm.parse(testComplexFieldsForm, {
                arr1: [
                    {
                        name: "d",
                        value: 4
                    },
                    {
                        name: "e",
                        value: 5
                    },
                    {
                        name: "f",
                        value: 6
                    }
                ],
                arr2: [
                    {
                        name: "g",
                        value: 7
                    },
                    {
                        name: "h",
                        value: 8
                    },
                    {
                        name: "i",
                        value: 9
                    },
                    {
                        name: "j",
                        value: 0
                    },
                    {
                        name: "k",
                        value: 1
                    }
                ],
                deep: {
                    obj: [
                        {
                            arr: [
                                {
                                    flag: "x"
                                }
                            ]
                        }
                    ]
                }
            });

            testComplexFieldsForm.querySelector(".f-arr1-0-name").value.should.be.exactly("d");
            testComplexFieldsForm.querySelector(".f-arr1-0-value").value.should.be.exactly("4");
            testComplexFieldsForm.querySelector(".f-arr1-1-name").value.should.be.exactly("e");
            testComplexFieldsForm.querySelector(".f-arr1-1-value").value.should.be.exactly("5");
            testComplexFieldsForm.querySelector(".f-arr1-2-name").value.should.be.exactly("f");
            testComplexFieldsForm.querySelector(".f-arr1-2-value").value.should.be.exactly("6");

            testComplexFieldsForm.querySelector(".f-arr2-2-name").value.should.be.exactly("i");
            testComplexFieldsForm.querySelector(".f-arr2-2-value").value.should.be.exactly("9");
            testComplexFieldsForm.querySelector(".f-arr2-4-name").value.should.be.exactly("k");
            testComplexFieldsForm.querySelector(".f-arr2-4-value").value.should.be.exactly("1");

            testComplexFieldsForm.querySelector(".f-deep-obj-arr-flag").value.should.be.exactly("x");
        });
    });
});

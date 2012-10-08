/// <reference path="scripts/qunit.js" />
/// <reference path="cbc.ns.js" />
/// <reference path="cbc.assert.js" />
/// <reference path="cbc.testhelpers.js" />

module("cbc.assert.testhelpers");

test("verifyAssertions: verifies all assertions", function () {

    // Arrange.
    var expectedValidvalues = "valid values";
    var expectedFuncToVerify = "func to verify";
    var pdefs = [
        {
            paramName: "p1",
            validValue: "valid value 1",
            assertions: "expected assertions 1"
        },
        {
            paramName: "p2",
            validValue: "valid value 2",
            assertions: "expected assertions 2"
        }
    ];

    var fetchValidCalled = false;
    var verifyAssertionCalled = false;
    var verifyAssertion2Called = false;

    var ctx = {
        _fetchValidValues: function (actualAssertions) {
            delete this._fetchValidValues;
            fetchValidCalled = true;
            strictEqual(actualAssertions, pdefs);
            return expectedValidvalues;
        },
        _verifyParam: function (options) {
            verifyAssertionCalled = true;
            strictEqual(options.func, expectedFuncToVerify);
            strictEqual(options.validValues, expectedValidvalues);
            strictEqual(options.paramIndex, 0);
            strictEqual(options.paramName, pdefs[0].paramName);
            strictEqual(options.assertions, pdefs[0].assertions);
            this._verifyParam = this._verifyParam2;
        },
        _verifyParam2: function (options) {
            verifyAssertion2Called = true;
            strictEqual(options.func, expectedFuncToVerify);
            strictEqual(options.validValues, expectedValidvalues);
            strictEqual(options.paramIndex, 1);
            strictEqual(options.paramName, pdefs[1].paramName);
            strictEqual(options.assertions, pdefs[1].assertions);
        }
    };

    // Act.
    cbc.testhelpers.verifyAssertions.call(ctx, expectedFuncToVerify, pdefs);

    // Assert.
    strictEqual(fetchValidCalled, true, "fetchValidCalled");
    strictEqual(verifyAssertionCalled, true, "verifyAssertionCalled");
    strictEqual(verifyAssertion2Called, true, "verifyAssertion2Called");
});

test("verifyParam: delegates and stuff", function () {

    // Arrange.
    var expectedParamName = "p1";
    var definedAssertion = "defined";
    var notNullAssertion = "not null";
    var expectedValidvalues = "valid values";
    var expectedParamIndex = 0;
    var expectedFuncToVerify = "func";
    var expectedProxyFunc = "proxy";

    var createProxyCalled = false;
    var verifyCalled = false;
    var verify2Called = false;

    var ctx = {
        _createVerifierProxy: function (options) {
            delete this._createVerifierProxy;
            createProxyCalled = true;
            strictEqual(options.validValues, expectedValidvalues);
            strictEqual(options.parameterIndex, expectedParamIndex);
            strictEqual(options.func, expectedFuncToVerify);
            return expectedProxyFunc;
        },
        _verifyAssertion: function (options) {
            verifyCalled = true;
            strictEqual(options.paramName, expectedParamName);
            strictEqual(options.assertionName, definedAssertion);
            strictEqual(options.proxy, expectedProxyFunc);
            delete this._verifyAssertion;
            this._verifyAssertion = this._verifyAssertion2;
        },
        _verifyAssertion2: function (options) {
            verify2Called = true;
            strictEqual(options.paramName, expectedParamName);
            strictEqual(options.assertionName, notNullAssertion);
            strictEqual(options.proxy, expectedProxyFunc);
        }
    };
    var options = {
        func: expectedFuncToVerify,
        validValues: expectedValidvalues,
        paramIndex: expectedParamIndex,
        paramName: expectedParamName,
        assertions: [ definedAssertion, notNullAssertion ]
    };

    // Act.
    cbc.testhelpers._verifyParam.call(ctx, options);

    // Assert.
    strictEqual(createProxyCalled, true, "createProxyCalled");
    strictEqual(verifyCalled, true, "verifyCalled");
    strictEqual(verify2Called, true, "verify2Called");
});

test("verifyAssertion: not supported assertion throws", function () {

    // Arrange.
    var unknownAssertionName = "not supported assertion";
    var options = {
        paramName: "p1",
        assertionName: unknownAssertionName
    };
    var ctx = {
        _assertionVerifiers: {}
    };

    // Act and assert.
    raises(function () {
        cbc.testhelpers._verifyAssertion.call(ctx, options);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' +
            unknownAssertionName +
            '" not implemented.';
    });
});

test("verifyAssertion: works", function () {

    // Arrange.
    var expectedParamName = "paramName";
    var expectedProxy = "proxy";
    var verifyCalled = false;
    var options = {
        paramName: expectedParamName,
        assertionName: "defined",
        proxy: expectedProxy
    };
    var ctx = {
        _assertionVerifiers: {
            defined: {
                verify: function (actualProxyFunc, actualParamName) {
                    verifyCalled = true;
                    strictEqual(actualProxyFunc, expectedProxy);
                    strictEqual(actualParamName, expectedParamName);
                }
            }
        }
    };

    // Act.
    cbc.testhelpers._verifyAssertion.call(ctx, options);

    // Assert.
    strictEqual(verifyCalled, true, "verifyCalled");
});

test("fetchValidValues: works", function () {

    // Arrange.
    var assertions = [
        { validValue: "valid value" },
        { validValue: "second valid value" }
    ];

    // Act.
    var expectedValues = cbc.testhelpers._fetchValidValues(assertions);

    // Assert.
    deepEqual(expectedValues, [
        assertions[0].validValue,
        assertions[1].validValue
    ]);
});

test("createVerifierProxy: assertions applied", function () {

    // Arrange.
    var func = cbc.testhelpers._createVerifierProxy;

    // Act and assert.
    raises(function () {
        func();
    }, function (e) {
        return e.message === "Parameter options must be specified.";
    });
    raises(function () {
        func(null);
    }, function (e) {
        return e.message === "Parameter options must not be null.";
    });
    raises(function () {
        func(1);
    }, function (e) {
        return e.message === "Parameter options must be of type object.";
    });
});

test("createVerifierProxy: works", function () {

    // Arrange.
    var funcCalled = false;
    var invalidValue = "invalid value";
    var options = {
        parameterIndex: 0,
        validValues: [ "valid1", "valid2" ],
        func: function (p1, p2) {
            funcCalled = true;
            strictEqual(p1, invalidValue);
            strictEqual(p2, options.validValues[1]);
        },
    };

    // Act.
    var actualProxy = cbc.testhelpers._createVerifierProxy(options);

    // Assert.
    strictEqual(typeof actualProxy === "function", true);
    actualProxy(invalidValue);
    strictEqual(funcCalled, true, "funcCalled");
});

test("defined: catches expected error", function () {

    // Arrange.
    var paramName = "param";
    var proxyCalled = false;
    var ctx = cbc.testhelpers._assertionVerifiers.defined;

    var proxy = function (actualInvalidValue) {
        proxyCalled = true;
        strictEqual(actualInvalidValue, ctx.invalidValue);
        throw new Error("Parameter param must be specified.");
    };

    // Act.
    ctx.verify.call(ctx, proxy, paramName);

    // Assert.
    strictEqual(proxyCalled, true, "proxyCalled");
    strictEqual(typeof ctx.invalidValue === "undefined", true);
});

test("defined: throws info when not expected error", function () {

    // Arrange.
    var paramName = "notherParam";
    var proxy = function (actualInvalidValue) { throw 1; };

    // Act and assert.
    raises(function () {
        cbc.testhelpers._assertionVerifiers.defined.verify(proxy, paramName);
    }, function (e) {
        return e.message === [
            'Verification for assertion "defined" on parameter ',
            paramName,
            " failed."
        ].join('"');
    });
});

test("defined: throws info when no error", function () {

    // Arrange.
    var paramName = "lastParam";
    var proxy = function (actualInvalidValue) {};

    // Act and assert.
    raises(function () {
        cbc.testhelpers._assertionVerifiers.defined.verify(proxy, paramName);
    }, function (e) {
        return e.message === [
            'Verification for assertion "defined" on parameter ',
            paramName,
            " failed."
        ].join('"');
    });
});

test("verifyAssertions: defined: integration", function () {

    // Arrange.
    function invalidFunc (one) {}
    function validFunc (a, b) {
        cbc.assert.param("a", a).is.defined();
        cbc.assert.param("b", b).is.defined();
    }

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { paramName: "one", validValue: 1, assertions: [ "defined" ] }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "defined" on parameter "one" failed.';
    });
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: "a", validValue: 1, assertions: [ "defined" ] },
        { paramName: "b", validValue: 2, assertions: [ "defined" ] }
    ]);
});

test("verifyAssertions: notNull: integration: invalid func", function () {

    // Arrange.
    var assert = "notNull";
    var pName = "a";
    function invalidFunc (a) {}

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { paramName: pName, validValue: 1, assertions: [ assert ] }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' + 
            assert + '" on parameter "' + pName + '" failed.';
    });
});

test("verifyAssertions: notNull: integration: valid func", function () {

    // Arrange.
    var assert = "notNull";
    var p1Name = "i";
    var p2Name = "ii";
    function validFunc (i, ii) {
        cbc.assert.param(p1Name, i).is.notNull();
        cbc.assert.param(p2Name, ii).is.notNull();
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: p1Name, validValue: 1, assertions: [ assert ] },
        // validValue not specified.
        // Note that undefined is a valid value.
        { paramName: p2Name, assertions: [ assert ] }
    ]);
});

test("verifyAssertions: bool: integration: invalid func", function () {

    // Arrange.
    var assert = "bool";
    var pName = "p1";
    function invalidFunc (p1) {}

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { paramName: pName, validValue: true, assertions: [ assert ] }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' + 
            assert + '" on parameter "' + pName + '" failed.';
    });
});

test("verifyAssertions: bool: integration: valid func", function () {

    // Arrange.
    var assert = "bool";
    var p1Name = "abc";
    var p2Name = "cba";
    function validFunc (abc, cba) {
        cbc.assert.param(p1Name, abc).is.bool();
        cbc.assert.param(p2Name, cba).is.bool();
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: p1Name, validValue: true, assertions: [ assert ] },
        { paramName: p2Name, validValue: false, assertions: [ assert ] }
    ]);
});

test("verifyAssertions: func: integration: invalid func", function () {

    // Arrange.
    var assert = "func";
    var pName = "x";
    function f() {}
    function invalidFunc (x) {}

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { paramName: pName, validValue: f, assertions: [ assert ] }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' + 
            assert + '" on parameter "' + pName + '" failed.';
    });
});

test("verifyAssertions: func: integration: valid func", function () {

    // Arrange.
    var assert = "func";
    var p1Name = "one";
    var p2Name = "two";
    function f () {}
    function validFunc (one, two) {
        cbc.assert.param(p1Name, one).is.func();
        cbc.assert.param(p2Name, two).is.func();
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: p1Name, validValue: f, assertions: [ assert ] },
        { paramName: p2Name, validValue: f, assertions: [ assert ] }
    ]);
});

test("verifyAssertions: number: integration: invalid func", function () {

    // Arrange.
    var assert = "number";
    var pName = "x";
    function invalidFunc (x) {}

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { paramName: pName, validValue: 1, assertions: [ assert ] }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' + 
            assert + '" on parameter "' + pName + '" failed.';
    });
});

test("verifyAssertions: number: integration: valid func", function () {

    // Arrange.
    var assert = "number";
    var p1Name = "one";
    var p2Name = "two";
    function validFunc (one, two) {
        cbc.assert.param(p1Name, one).is.number();
        cbc.assert.param(p2Name, two).is.number();
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: p1Name, validValue: 1, assertions: [ assert ] },
        { paramName: p2Name, validValue: 2, assertions: [ assert ] }
    ]);
});

test("verifyAssertions: object: integration: invalid func", function () {

    // Arrange.
    var assert = "object";
    var pName = "x";
    function invalidFunc (x) {}

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { paramName: pName, validValue: {}, assertions: [ assert ] }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' + 
            assert + '" on parameter "' + pName + '" failed.';
    });
});

test("verifyAssertions: object: integration: valid func", function () {

    // Arrange.
    var assert = "object";
    var p1Name = "one";
    var p2Name = "two";
    function validFunc (one, two) {
        cbc.assert.param(p1Name, one).is.object();
        cbc.assert.param(p2Name, two).is.object();
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: p1Name, validValue: {}, assertions: [ assert ] },
        { paramName: p2Name, validValue: {}, assertions: [ assert ] }
    ]);
});

test("verifyAssertions: string: integration: invalid func", function () {

    // Arrange.
    var assert = "string";
    var pName = "p";
    function invalidFunc (p) {}

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { paramName: pName, validValue: "", assertions: [ assert ] }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' + 
            assert + '" on parameter "' + pName + '" failed.';
    });
});

test("verifyAssertions: string: integration: valid func", function () {

    // Arrange.
    var assert = "string";
    var p1Name = "one";
    var p2Name = "two";
    function validFunc (one, two) {
        cbc.assert.param(p1Name, one).is.string();
        cbc.assert.param(p2Name, two).is.string();
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: p1Name, validValue: "", assertions: [ assert ] },
        { paramName: p2Name, validValue: "foo", assertions: [ assert ] }
    ]);
});

test("verifyAssertions: notEmpty: integration: invalid func", function () {

    // Arrange.
    var assert = "notEmpty";
    var pName = "p";
    function invalidFunc (p) {
        cbc.assert.param(pName, p).is.defined().and.notNull().and.string();
    }

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions(invalidFunc, [
            { 
                paramName: pName, 
                validValue: "bar", 
                assertions: [
                    "defined", "notNull", "string", assert
                ]
            }
        ]);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' + 
            assert + '" on parameter "' + pName + '" failed.';
    });
});

test("verifyAssertions: notEmpty: integration: valid func", function () {

    // Arrange.
    var assert = "notEmpty";
    var p1Name = "one";
    var p2Name = "two";
    function validFunc (one, two) {
        cbc.assert.that.param(p1Name, one).is
            .defined()
            .and.notNull()
            .and.string()
            .and.notEmpty();
        cbc.assert.param(p2Name, two).is.string().and.notEmpty();
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        {
            paramName: p1Name, 
            validValue: "not empty string", 
            assertions: [
                "defined", "notNull", "string", assert 
            ]
        },
        {
            paramName: p2Name,
            validValue: null,
            assertions: [ "string", assert ]
        }
    ]);
});

test("verifyAssertions: extended sample", function () {

    // Arrange.
    function validFunc (a, b, c, d) {
        cbc.assert.param("a", a).is.bool();
        cbc.assert.param("b", b).is.notNull();
        cbc.assert.param("c", c).is.defined().and.notNull().and.number();
        cbc.assert.that.param("d", d).is
            .defined()
            .and.notNull()
            .and.string()
            .and.notEmpty();
        callFunctionThatDoesNotExist(invalidVariable);
    }

    // Act and assert.
    cbc.testhelpers.verifyAssertions(validFunc, [
        { paramName: "a", validValue: false, assertions: [ "bool" ] },
        { paramName: "b", validValue: 1, assertions: [ "notNull" ] },
        {
            paramName: "c",
            validValue: 123,
            assertions: [ "defined", "notNull", "number" ]
        },
        {
            paramName: "d",
            validValue: "valid string",
            assertions: [ "defined", "notNull", "string", "notEmpty" ]
        }
    ]);
});
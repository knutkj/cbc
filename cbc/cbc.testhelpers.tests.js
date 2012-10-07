/// <reference path="scripts/qunit.js" />
/// <reference path="cbc.ns.js" />
/// <reference path="cbc.assert.js" />
/// <reference path="cbc.testhelpers.js" />

module("cbc.assert.testhelpers");

test("verifyAssertions: not supported assertions throws", function () {

    // Arrange.
    var unknownAssertionName = "not supported";
    var assertions = [
        {
            paramName: "p1",
            validValue: "valid value",
            assertions: [ unknownAssertionName ]
        }
    ];
    var ctx = { _fetchValidValues: function () {} };

    // Act and assert.
    raises(function () {
        cbc.testhelpers.verifyAssertions.call(ctx, function () {}, assertions);
    }, function (e) {
        return e.message ===
            'Verification for assertion "' +
            unknownAssertionName +
            '" not implemented.';
    });
});

test("verifyAssertions: delegates and stuff", function () {

    // Arrange.
    var expectedParamName = "p1";
    var definedAssertion = "defined";
    var expectedValidvalues = "valid values";
    var expectedFuncToVerify = function () {};
    var epxctedProxyFunc = function () {};

    var fetchValidCalled = false;
    var createProxyCalled = false;
    var verifyCalled = false;

    var ctx = {
        _fetchValidValues: function (actualAssertions) {
            fetchValidCalled = true;
            strictEqual(actualAssertions, assertions);
            return expectedValidvalues;
        },
        _createVerifierProxy: function (options) {
            createProxyCalled = true;
            strictEqual(options.validValues, expectedValidvalues);
            strictEqual(options.parameterIndex, 0);
            strictEqual(options.func, expectedFuncToVerify);
            return epxctedProxyFunc;
        },
        _assertionVerifiers: {
            defined: {
                verify: function (actualProxyFunc, actualParamName) {
                    verifyCalled = true;
                    strictEqual(actualProxyFunc, epxctedProxyFunc);
                    strictEqual(actualParamName, expectedParamName);
                }
            }
        }
    };

    var assertions = [
        {
            paramName: expectedParamName,
            validValue: "valid value",
            assertions: [ definedAssertion ]
        }
    ];

    // Act.
    cbc.testhelpers.verifyAssertions.call(
        ctx,
        expectedFuncToVerify,
        assertions
    );

    // Assert.
    strictEqual(fetchValidCalled, true, "fetchValidCalled");
    strictEqual(createProxyCalled, true, "createProxyCalled");
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
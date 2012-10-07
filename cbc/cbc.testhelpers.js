/// <reference path="cbc.ns.js" />
/// <reference path="cbc.assert.js" />
/// <reference path="cbc.parse.js" />
/// <reference path="cbc.contract.js" />

(function () {

    var assertionVerifiers = {
        defined: {}
    };

    function verifyAssertions(func, assertions) {
        /// <summary>
        /// Verifies that the specified assertions has been applied correctly
        /// to the specified function.
        /// </summary>
        /// <param name="func" type="Function">
        /// The function to verify.
        /// </param>
        /// <param name="assertions" type="Array">
        /// The assertions to verify.
        /// </param>
        var validValues = this._fetchValidValues(assertions);
        var parameterIndex = 0;
        var paramName = assertions[parameterIndex].paramName;
        var assertionName = assertions[parameterIndex].assertions[0];
        if (!assertionVerifiers[assertionName]) {
            throw new Error([
                "Verification for assertion ",
                assertionName,
                " not implemented."
            ].join('"'));
        }
        var proxy = this._createVerifierProxy({
            validValues: validValues,
            parameterIndex: parameterIndex,
            func: func
        });
        this._assertionVerifiers[assertionName].verify(proxy, paramName);
    }

    function fetchValidValues (assertions) {
        /// <summary>
        /// Returns a list of fetched valid values.
        /// </summary>
        /// <param name="assertions" type="Array">
        /// A list of assertions.
        /// </param>
        /// <returns type="Array">
        /// A list of valid values.
        /// </returns>
        var validValues = [];
        var numberOfAssertions = assertions.length;
        for (var i = 0; i < numberOfAssertions; i++) {
            validValues.push(assertions[i].validValue);
        }
        return validValues;
    }

    function createVerifierProxy (options) {
        /// <summary>
        /// Creates a verifier proxy.
        /// </summary>
        /// <param name="options" type="Object">
        /// Options for verifier proxy.
        /// </param>
        /// <returns type="Function">
        /// A verifier proxy.
        /// </returns>
        return function (invalidValue) {
            var args = options.validValues.slice(0);
            args[options.parameterIndex] = invalidValue;
            options.func.apply({}, args);
        };
    }

    var helpers = {
        verifyAssertions: verifyAssertions,
        _fetchValidValues: fetchValidValues,
        _createVerifierProxy: cbc.contract.wrap(createVerifierProxy),
        _assertionVerifiers: assertionVerifiers
    };

    cbc.testhelpers = helpers;
}());
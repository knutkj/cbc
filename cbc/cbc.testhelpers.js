/// <reference path="cbc.ns.js" />
/// <reference path="cbc.assert.js" />
/// <reference path="cbc.parse.js" />
/// <reference path="cbc.contract.js" />

(function () {

    var assertionVerifiers = {
        defined: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must be specified.",
                    verificationMsg("defined", paramName)
                );
            }
        },
        notNull: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must not be null.",
                    verificationMsg("notNull", paramName),
                    null
                );
            }
        },
        bool: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must be of type boolean.",
                    verificationMsg("bool", paramName),
                    1
                );
            }
        },
        func: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must be of type function.",
                    verificationMsg("func", paramName),
                    1
                );
            }
        },
        number: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must be of type number.",
                    verificationMsg("number", paramName),
                    true
                );
            }
        },
        object: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must be of type object.",
                    verificationMsg("object", paramName),
                    1
                );
            }
        },
        string: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must be of type string.",
                    verificationMsg("string", paramName),
                    1
                );
            }
        },
        notEmpty: {
            verify: function (proxy, paramName) {
                verify(
                    proxy,
                    "Parameter " + paramName + " must not be empty string.",
                    verificationMsg("notEmpty", paramName),
                    ""
                );
            }
        }
    };

    function verificationMsg(assertionName, paramName) {
        return [
            "Verification for assertion ", assertionName,
            " on parameter ", paramName, " failed."
        ].join('"')
    }

    function verify (proxy, expectedMessage, errorMessage, invalidValue) {
        try {
            proxy(invalidValue);
            throw new Error(errorMessage);
        } catch (e) {                
            if (e.message !== expectedMessage) {
                throw new Error(errorMessage);
            }
        }
    }

    function verifyAssertions(func, paramDefs) {
        /// <summary>
        /// Verifies that the specified assertions has been applied correctly
        /// to the specified function.
        /// </summary>
        /// <param name="func" type="Function">
        /// The function to verify.
        /// </param>
        /// <param name="paramDefs" type="Array">
        /// Parameter definitions for the parameters to verify.
        /// </param>
        var validValues = this._fetchValidValues(paramDefs);
        for (var i = 0; i < paramDefs.length; i++) {
            this._verifyParam({
                func: func,
                validValues: validValues,
                paramIndex: i,
                paramName: paramDefs[i].paramName,
                assertions: paramDefs[i].assertions
            });
        }
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

    function verifyParam (options) {
        /// <summary>
        /// Verifies that assertions for a parameter has been applied
        /// correctly.
        /// </summary>
        /// <param name="options" type="Object">
        /// Parameter options.
        /// </param>
        var proxy = this._createVerifierProxy({
            validValues: options.validValues,
            parameterIndex: options.paramIndex,
            func: options.func
        });
        for (var i = 0; i < options.assertions.length; i++) {
            this._verifyAssertion({
                paramName: options.paramName,
                assertionName: options.assertions[i],
                proxy: proxy
            });
        }
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

    function verifyAssertion (options) {
        /// <summary>
        /// Verifies that the specified assertion has been applied correctly.
        /// </summary>
        /// <param name="options" type="Object">
        /// The assertion options.
        /// </param>
        if (!this._assertionVerifiers[options.assertionName]) {
            throw new Error([
                "Verification for assertion ",
                options.assertionName,
                " not implemented."
            ].join('"'));
        }
        this
            ._assertionVerifiers[options.assertionName]
            .verify(options.proxy, options.paramName);
    }

    cbc.testhelpers = {
        verifyAssertions: verifyAssertions,
        _fetchValidValues: fetchValidValues,
        _verifyParam: verifyParam,
        _createVerifierProxy: cbc.contract.wrap(createVerifierProxy),
        _verifyAssertion: verifyAssertion,
        _assertionVerifiers: assertionVerifiers
    };
}());
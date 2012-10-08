================================================================================
 CALL BY CONTRACT (CBC) JAVASCRIPT LIBRARY
================================================================================

A JavaScript library with function argument assertions, a function parser and
assertion wrapper functionality.

Include cbc.js or cbc.min.js for all CbC functionality.

Visit https://github.com/knutkj/cbc/wiki for documentation.

Please use the issue tracker at https://github.com/knutkj/cbc/issues for feature
requests. Tag issues with the enhancement label.

--------------------------------------------------------------------------------
 RELEASE NOTES
--------------------------------------------------------------------------------

 1.2.* (Under development)
---------------------------
 - Implemented CbC test helpers. See
   https://github.com/knutkj/cbc/wiki/CbC-test-helpers for more information

 1.2.0
-------
 - Breaking change in FuncInfo/ParamInfo getters. Changed from getPropertyName
   into get_propertyName
 - New wrap function (cbc.contract.wrap)
 - New getDoc function (cbc.parse.getDoc)

 1.1.0
-------
 - New function parser (cbc.parse.func)
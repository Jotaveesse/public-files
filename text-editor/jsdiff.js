/*!

 diff v2.0.1

Software License Agreement (BSD License)

Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>

All rights reserved.

Redistribution and use of this software in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above
  copyright notice, this list of conditions and the
  following disclaimer.

* Redistributions in binary form must reproduce the above
  copyright notice, this list of conditions and the
  following disclaimer in the documentation and/or other
  materials provided with the distribution.

* Neither the name of Kevin Decker nor the names of its
  contributors may be used to endorse or promote products
  derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
@license
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["JsDiff"] = factory();
	else
		root["JsDiff"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* See LICENSE file for terms of use */

	/*
	 * Text diff implementation.
	 *
	 * This library supports the following APIS:
	 * JsDiff.diffChars: Character by character diff
	 * JsDiff.diffWords: Word (as defined by \b regex) diff which ignores whitespace
	 * JsDiff.diffLines: Line based diff
	 *
	 * JsDiff.diffCss: Diff targeted at CSS content
	 *
	 * These methods are based on the implementation proposed in
	 * "An O(ND) Difference Algorithm and its Variations" (Myers, 1986).
	 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
	 */
	'use strict';

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _diffBase = __webpack_require__(1);

	var _diffBase2 = _interopRequireDefault(_diffBase);

	var _diffCharacter = __webpack_require__(3);

	var _diffWord = __webpack_require__(4);

	var _diffLine = __webpack_require__(5);

	var _diffSentence = __webpack_require__(6);

	var _diffCss = __webpack_require__(7);

	var _diffJson = __webpack_require__(8);

	var _patchApply = __webpack_require__(9);

	var _patchCreate = __webpack_require__(10);

	var _convertDmp = __webpack_require__(12);

	var _convertXml = __webpack_require__(13);

	exports.Diff = _diffBase2['default'];
	exports.diffChars = _diffCharacter.diffChars;
	exports.diffWords = _diffWord.diffWords;
	exports.diffWordsWithSpace = _diffWord.diffWordsWithSpace;
	exports.diffLines = _diffLine.diffLines;
	exports.diffTrimmedLines = _diffLine.diffTrimmedLines;
	exports.diffSentences = _diffSentence.diffSentences;
	exports.diffCss = _diffCss.diffCss;
	exports.diffJson = _diffJson.diffJson;
	exports.structuredPatch = _patchCreate.structuredPatch;
	exports.createTwoFilesPatch = _patchCreate.createTwoFilesPatch;
	exports.createPatch = _patchCreate.createPatch;
	exports.applyPatch = _patchApply.applyPatch;
	exports.convertChangesToDMP = _convertDmp.convertChangesToDMP;
	exports.convertChangesToXML = _convertXml.convertChangesToXML;
	exports.canonicalize = _diffJson.canonicalize;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = Diff;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utilMap = __webpack_require__(2);

	var _utilMap2 = _interopRequireDefault(_utilMap);

	function Diff(ignoreWhitespace) {
	  this.ignoreWhitespace = ignoreWhitespace;
	}

	Diff.prototype = {
  diff(oldString, newString, options = {}) {
    let callback = options.callback;
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    this.options = options;

    let self = this;

    function done(value) {
      if (callback) {
        setTimeout(function() { callback(undefined, value); }, 0);
        return true;
      } else {
        return value;
      }
    }

    // Allow subclasses to massage the input prior to running
    oldString = this.castInput(oldString);
    newString = this.castInput(newString);

    oldString = this.removeEmpty(this.tokenize(oldString));
    newString = this.removeEmpty(this.tokenize(newString));

    let newLen = newString.length, oldLen = oldString.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    let bestPath = [{ newPos: -1, components: [] }];

    // Seed editLength = 0, i.e. the content starts with the same values
    let oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
      // Identity per the equality and tokenizer
      return done([{value: this.join(newString), count: newString.length}]);
    }

    // Main worker method. checks all permutations of a given edit length for acceptance.
    function execEditLength() {
      for (let diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
        let basePath;
        let addPath = bestPath[diagonalPath - 1],
            removePath = bestPath[diagonalPath + 1],
            oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
        if (addPath) {
          // No one else is going to attempt to use this value, clear it
          bestPath[diagonalPath - 1] = undefined;
        }

        let canAdd = addPath && addPath.newPos + 1 < newLen,
            canRemove = removePath && 0 <= oldPos && oldPos < oldLen;
        if (!canAdd && !canRemove) {
          // If this path is a terminal then prune
          bestPath[diagonalPath] = undefined;
          continue;
        }

        // Select the diagonal that we want to branch from. We select the prior
        // path whose position in the new string is the farthest from the origin
        // and does not pass the bounds of the diff graph
        if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
          basePath = clonePath(removePath);
          self.pushComponent(basePath.components, undefined, true);
        } else {
          basePath = addPath; // No need to clone, we've pulled it from the list
          basePath.newPos++;
          self.pushComponent(basePath.components, true, undefined);
        }

        oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath);

        // If we have hit the end of both strings, then we are done
        if (basePath.newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
          return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
        } else {
          // Otherwise track this path as a potential candidate and continue.
          bestPath[diagonalPath] = basePath;
        }
      }

      editLength++;
    }

    // Performs the length of edit iteration. Is a bit fugly as this has to support the
    // sync and async mode which is never fun. Loops over execEditLength until a value
    // is produced.
    if (callback) {
      (function exec() {
        setTimeout(function() {
          // This should not happen, but we want to be safe.
          /* istanbul ignore next */
          if (editLength > maxEditLength) {
            return callback();
          }

          if (!execEditLength()) {
            exec();
          }
        }, 0);
      }());
    } else {
      while (editLength <= maxEditLength) {
        let ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  },

  pushComponent(components, added, removed) {
    let last = components[components.length - 1];
    if (last && last.added === added && last.removed === removed) {
      // We need to clone here as the component clone operation is just
      // as shallow array clone
      components[components.length - 1] = {count: last.count + 1, added: added, removed: removed };
    } else {
      components.push({count: 1, added: added, removed: removed });
    }
  },
  extractCommon(basePath, newString, oldString, diagonalPath) {
    let newLen = newString.length,
        oldLen = oldString.length,
        newPos = basePath.newPos,
        oldPos = newPos - diagonalPath,

        commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
      newPos++;
      oldPos++;
      commonCount++;
    }

    if (commonCount) {
      basePath.components.push({count: commonCount});
    }

    basePath.newPos = newPos;
    return oldPos;
  },

  equals(left, right) {
    if (this.options.comparator) {
      return this.options.comparator(left, right);
    } else {
      return left === right
        || (this.options.ignoreCase && left.toLowerCase() === right.toLowerCase());
    }
  },
  removeEmpty(array) {
    let ret = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  },
  castInput(value) {
    return value;
  },
  tokenize(value) {
    return value.split('');
  },
  join(chars) {
    return chars.join('');
  }
};

function buildValues(diff, components, newString, oldString, useLongestToken) {
  let componentPos = 0,
      componentLen = components.length,
      newPos = 0,
      oldPos = 0;

  for (; componentPos < componentLen; componentPos++) {
    let component = components[componentPos];
    if (!component.removed) {
      if (!component.added && useLongestToken) {
        let value = newString.slice(newPos, newPos + component.count);
        value = value.map(function(value, i) {
          let oldValue = oldString[oldPos + i];
          return oldValue.length > value.length ? oldValue : value;
        });

        component.value = diff.join(value);
      } else {
        component.value = diff.join(newString.slice(newPos, newPos + component.count));
      }
      newPos += component.count;

      // Common case
      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = diff.join(oldString.slice(oldPos, oldPos + component.count));
      oldPos += component.count;

      // Reverse add and remove so removes are output first to match common convention
      // The diffing algorithm is tied to add then remove output and this is the simplest
      // route to get the desired output with minimal overhead.
      if (componentPos && components[componentPos - 1].added) {
        let tmp = components[componentPos - 1];
        components[componentPos - 1] = components[componentPos];
        components[componentPos] = tmp;
      }
    }
  }

  // Special case handle for when one terminal is ignored (i.e. whitespace).
  // For this case we merge the terminal into the prior string and drop the change.
  // This is only available for string mode.
  let lastComponent = components[componentLen - 1];
  if (componentLen > 1
      && typeof lastComponent.value === 'string'
      && (lastComponent.added || lastComponent.removed)
      && diff.equals('', lastComponent.value)) {
    components[componentLen - 2].value += lastComponent.value;
    components.pop();
  }

  return components;
}

function clonePath(path) {
  return { newPos: path.newPos, components: path.components.slice(0) };
}
	module.exports = exports['default'];


/***/ },
/* 2 */
/***/ function(module, exports) {

	// Following this pattern to make sure the ignore next is in the correct place after babel builds
	"use strict";

	exports.__esModule = true;
	exports["default"] = map;

	/* istanbul ignore next */
	function map(arr, mapper, that) {
	  if (Array.prototype.map) {
	    return Array.prototype.map.call(arr, mapper, that);
	  }

	  var other = new Array(arr.length);

	  for (var i = 0, n = arr.length; i < n; i++) {
	    other[i] = mapper.call(that, arr[i], i, arr);
	  }
	  return other;
	}
	module.exports = exports["default"];


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.diffChars = diffChars;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _base = __webpack_require__(1);

	var _base2 = _interopRequireDefault(_base);

	var characterDiff = new _base2['default']();
	exports.characterDiff = characterDiff;
	
	function diffChars(oldStr, newStr, options) { 
		return characterDiff.diff(oldStr, newStr, options); 
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.diffWords = diffWords;
	exports.diffWordsWithSpace = diffWordsWithSpace;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _base = __webpack_require__(1);

	// Based on https://en.wikipedia.org/wiki/Latin_script_in_Unicode
	//
	// Ranges and exceptions:
	// Latin-1 Supplement, 0080–00FF
	//  - U+00D7  × Multiplication sign
	//  - U+00F7  ÷ Division sign
	// Latin Extended-A, 0100–017F
	// Latin Extended-B, 0180–024F
	// IPA Extensions, 0250–02AF
	// Spacing Modifier Letters, 02B0–02FF
	//  - U+02C7  ˇ &#711;  Caron
	//  - U+02D8  ˘ &#728;  Breve
	//  - U+02D9  ˙ &#729;  Dot Above
	//  - U+02DA  ˚ &#730;  Ring Above
	//  - U+02DB  ˛ &#731;  Ogonek
	//  - U+02DC  ˜ &#732;  Small Tilde
	//  - U+02DD  ˝ &#733;  Double Acute Accent
	// Latin Extended Additional, 1E00–1EFF
	const extendedWordChars = /^[a-zA-Z\u{C0}-\u{FF}\u{D8}-\u{F6}\u{F8}-\u{2C6}\u{2C8}-\u{2D7}\u{2DE}-\u{2FF}\u{1E00}-\u{1EFF}]+$/u;
	var _base2 = _interopRequireDefault(_base);
	const reWhitespace = /\S/;

 
	var wordDiff = new _base2['default'](true);
	exports.wordDiff = wordDiff;
	wordDiff.equals = function(left, right) {
	  if (this.options.ignoreCase) {
		left = left.toLowerCase();
		right = right.toLowerCase();
	  }
	  return left === right || (this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right));
	};
	wordDiff.tokenize = function(value) {
	  // All whitespace symbols except newline group into one token, each newline - in separate token
	  let tokens = value.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/);

	  // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.
	  for (let i = 0; i < tokens.length - 1; i++) {
		// If we have an empty string in the next field and we have only word chars before and after, merge
		if (!tokens[i + 1] && tokens[i + 2]
			  && extendedWordChars.test(tokens[i])
			  && extendedWordChars.test(tokens[i + 2])) {
		  tokens[i] += tokens[i + 2];
		  tokens.splice(i + 1, 2);
		  i--;
		}
	  }
	  return tokens;
	};

	 function diffWords(oldStr, newStr, options) {
		 
	  options = generateOptions(options, {ignoreWhitespace: true});
	  return wordDiff.diff(oldStr, newStr, options);
	}

	 function diffWordsWithSpace(oldStr, newStr, options) {
	  return wordDiff.diff(oldStr, newStr, options);
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.diffLines = diffLines;
	exports.diffTrimmedLines = diffTrimmedLines;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _base = __webpack_require__(1);

	var _base2 = _interopRequireDefault(_base);

	var lineDiff = new _base2['default']();
	exports.lineDiff = lineDiff;
	var trimmedLineDiff = new _base2['default']();
	exports.trimmedLineDiff = trimmedLineDiff;
	trimmedLineDiff.ignoreTrim = true;

	lineDiff.tokenize = function(value) {
	  let retLines = [],
		  linesAndNewlines = value.split(/(\n|\r\n)/);

	  // Ignore the final empty token that occurs if the string ends with a new line
	  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
		linesAndNewlines.pop();
	  }

	  // Merge the content and line separators into single tokens
	  for (let i = 0; i < linesAndNewlines.length; i++) {
		let line = linesAndNewlines[i];

		if (i % 2 && !this.options.newlineIsToken) {
		  retLines[retLines.length - 1] += line;
		} else {
		  if (this.options.ignoreWhitespace) {
			line = line.trim();
		  }
		  retLines.push(line);
		}
	  }

	  return retLines;
	};

	function diffLines(oldStr, newStr, callback) {
		return lineDiff.diff(oldStr, newStr, callback); 
	}
	function diffTrimmedLines(oldStr, newStr, callback) {
	  let options = generateOptions(callback, {ignoreWhitespace: true});
	  return lineDiff.diff(oldStr, newStr, options);
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.diffSentences = diffSentences;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _base = __webpack_require__(1);

	var _base2 = _interopRequireDefault(_base);

	var sentenceDiff = new _base2['default']();
	exports.sentenceDiff = sentenceDiff;
	sentenceDiff.tokenize = function(value) {
	  return value.split(/(\S.+?[.!?])(?=\s+|$)/);
	};

	function diffSentences(oldStr, newStr, callback) {
		return sentenceDiff.diff(oldStr, newStr, callback);
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.diffCss = diffCss;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _base = __webpack_require__(1);

	var _base2 = _interopRequireDefault(_base);

	var cssDiff = new _base2['default']();
	exports.cssDiff = cssDiff;
	cssDiff.tokenize = function(value) {
		return value.split(/([{}:;,]|\s+)/);
	};

	function diffCss(oldStr, newStr, callback) {
		return cssDiff.diff(oldStr, newStr, callback);
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.diffJson = diffJson;
	exports.canonicalize = canonicalize;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _base = __webpack_require__(1);

	var _base2 = _interopRequireDefault(_base);

	var _line = __webpack_require__(5);

	var objectPrototypeToString = Object.prototype.toString;

	var jsonDiff = new _base2['default']();
	// Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
	// dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:
	exports.jsonDiff = jsonDiff;
	jsonDiff.tokenize = _line.lineDiff.tokenize;
	jsonDiff.castInput = function(value) {
	  const {undefinedReplacement, stringifyReplacer = (k, v) => typeof v === 'undefined' ? undefinedReplacement : v} = this.options;

	  return typeof value === 'string' ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, '  ');
	};
	jsonDiff.equals = function(left, right) {
	  return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
	};

	function diffJson(oldObj, newObj, options) {
		return jsonDiff.diff(oldObj, newObj, options);
	}

	// This function handles the presence of circular references by bailing out when encountering an
	// object that is already on the "stack" of items being processed. Accepts an optional replacer
	function canonicalize(obj, stack, replacementStack, replacer, key) {
	  stack = stack || [];
	  replacementStack = replacementStack || [];

	  if (replacer) {
		obj = replacer(key, obj);
	  }

	  let i;

	  for (i = 0; i < stack.length; i += 1) {
		if (stack[i] === obj) {
		  return replacementStack[i];
		}
	  }

	  let canonicalizedObj;

	  if ('[object Array]' === objectPrototypeToString.call(obj)) {
		stack.push(obj);
		canonicalizedObj = new Array(obj.length);
		replacementStack.push(canonicalizedObj);
		for (i = 0; i < obj.length; i += 1) {
		  canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key);
		}
		stack.pop();
		replacementStack.pop();
		return canonicalizedObj;
	  }

	  if (obj && obj.toJSON) {
		obj = obj.toJSON();
	  }

	  if (typeof obj === 'object' && obj !== null) {
		stack.push(obj);
		canonicalizedObj = {};
		replacementStack.push(canonicalizedObj);
		let sortedKeys = [],
			key;
		for (key in obj) {
		  /* istanbul ignore else */
		  if (obj.hasOwnProperty(key)) {
			sortedKeys.push(key);
		  }
		}
		sortedKeys.sort();
		for (i = 0; i < sortedKeys.length; i += 1) {
		  key = sortedKeys[i];
		  canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack, replacer, key);
		}
		stack.pop();
		replacementStack.pop();
	  } else {
		canonicalizedObj = obj;
	  }
	  return canonicalizedObj;
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.applyPatch = applyPatch;

	function applyPatch(oldStr, uniDiff) {
	  var diffstr = uniDiff.split('\n'),
	      hunks = [],
	      i = 0,
	      remEOFNL = false,
	      addEOFNL = false;

	  // Skip to the first change hunk
	  while (i < diffstr.length && !/^@@/.test(diffstr[i])) {
	    i++;
	  }

	  // Parse the unified diff
	  for (; i < diffstr.length; i++) {
	    if (diffstr[i][0] === '@') {
	      var chnukHeader = diffstr[i].split(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
	      hunks.unshift({
	        start: chnukHeader[3],
	        oldlength: +chnukHeader[2],
	        removed: [],
	        newlength: chnukHeader[4],
	        added: []
	      });
	    } else if (diffstr[i][0] === '+') {
	      hunks[0].added.push(diffstr[i].substr(1));
	    } else if (diffstr[i][0] === '-') {
	      hunks[0].removed.push(diffstr[i].substr(1));
	    } else if (diffstr[i][0] === ' ') {
	      hunks[0].added.push(diffstr[i].substr(1));
	      hunks[0].removed.push(diffstr[i].substr(1));
	    } else if (diffstr[i][0] === '\\') {
	      if (diffstr[i - 1][0] === '+') {
	        remEOFNL = true;
	      } else if (diffstr[i - 1][0] === '-') {
	        addEOFNL = true;
	      }
	    }
	  }

	  // Apply the diff to the input
	  var lines = oldStr.split('\n');
	  for (i = hunks.length - 1; i >= 0; i--) {
	    var hunk = hunks[i];
	    // Sanity check the input string. Bail if we don't match.
	    for (var j = 0; j < hunk.oldlength; j++) {
	      if (lines[hunk.start - 1 + j] !== hunk.removed[j]) {
	        return false;
	      }
	    }
	    Array.prototype.splice.apply(lines, [hunk.start - 1, hunk.oldlength].concat(hunk.added));
	  }

	  // Handle EOFNL insertion/removal
	  if (remEOFNL) {
	    while (!lines[lines.length - 1]) {
	      lines.pop();
	    }
	  } else if (addEOFNL) {
	    lines.push('');
	  }
	  return lines.join('\n');
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.structuredPatch = structuredPatch;
	exports.createTwoFilesPatch = createTwoFilesPatch;
	exports.createPatch = createPatch;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _diffPatch = __webpack_require__(11);

	var _utilMap = __webpack_require__(2);

	var _utilMap2 = _interopRequireDefault(_utilMap);

	function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
	  if (!options) {
	    options = { context: 4 };
	  }

	  var diff = _diffPatch.patchDiff.diff(oldStr, newStr);
	  diff.push({ value: '', lines: [] }); // Append an empty value to make cleanup easier

	  function contextLines(lines) {
	    return _utilMap2['default'](lines, function (entry) {
	      return ' ' + entry;
	    });
	  }

	  var hunks = [];
	  var oldRangeStart = 0,
	      newRangeStart = 0,
	      curRange = [],
	      oldLine = 1,
	      newLine = 1;

	  var _loop = function (i) {
	    var current = diff[i],
	        lines = current.lines || current.value.replace(/\n$/, '').split('\n');
	    current.lines = lines;

	    if (current.added || current.removed) {
	      // If we have previous context, start with that
	      if (!oldRangeStart) {
	        var prev = diff[i - 1];
	        oldRangeStart = oldLine;
	        newRangeStart = newLine;

	        if (prev) {
	          curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
	          oldRangeStart -= curRange.length;
	          newRangeStart -= curRange.length;
	        }
	      }

	      // Output our changes
	      curRange.push.apply(curRange, _utilMap2['default'](lines, function (entry) {
	        return (current.added ? '+' : '-') + entry;
	      }));

	      // Track the updated file position
	      if (current.added) {
	        newLine += lines.length;
	      } else {
	        oldLine += lines.length;
	      }
	    } else {
	      // Identical context lines. Track line changes
	      if (oldRangeStart) {
	        // Close out any changes that have been output (or join overlapping)
	        if (lines.length <= options.context * 2 && i < diff.length - 2) {
	          // Overlapping
	          curRange.push.apply(curRange, contextLines(lines));
	        } else {
	          // end the range and output
	          var contextSize = Math.min(lines.length, options.context);
	          curRange.push.apply(curRange, contextLines(lines.slice(0, contextSize)));

	          var hunk = {
	            oldStart: oldRangeStart,
	            oldLines: oldLine - oldRangeStart + contextSize,
	            newStart: newRangeStart,
	            newLines: newLine - newRangeStart + contextSize,
	            lines: curRange
	          };
	          if (i >= diff.length - 2 && lines.length <= options.context) {
	            // EOF is inside this hunk
	            var oldEOFNewline = /\n$/.test(oldStr);
	            var newEOFNewline = /\n$/.test(newStr);
	            if (lines.length == 0 && !oldEOFNewline) {
	              // special case: old has no eol and no trailing context; no-nl can end up before adds
	              curRange.splice(hunk.oldLines, 0, '\\ No newline at end of file');
	            } else if (!oldEOFNewline || !newEOFNewline) {
	              curRange.push('\\ No newline at end of file');
	            }
	          }
	          hunks.push(hunk);

	          oldRangeStart = 0;
	          newRangeStart = 0;
	          curRange = [];
	        }
	      }
	      oldLine += lines.length;
	      newLine += lines.length;
	    }
	  };

	  for (var i = 0; i < diff.length; i++) {
	    _loop(i);
	  }

	  return {
	    oldFileName: oldFileName, newFileName: newFileName,
	    oldHeader: oldHeader, newHeader: newHeader,
	    hunks: hunks
	  };
	}

	function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
	  var diff = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);

	  var ret = [];
	  if (oldFileName == newFileName) {
	    ret.push('Index: ' + oldFileName);
	  }
	  ret.push('===================================================================');
	  ret.push('--- ' + diff.oldFileName + (typeof diff.oldHeader === 'undefined' ? '' : '\t' + diff.oldHeader));
	  ret.push('+++ ' + diff.newFileName + (typeof diff.newHeader === 'undefined' ? '' : '\t' + diff.newHeader));

	  for (var i = 0; i < diff.hunks.length; i++) {
	    var hunk = diff.hunks[i];
	    ret.push('@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@');
	    ret.push.apply(ret, hunk.lines);
	  }

	  return ret.join('\n') + '\n';
	}

	function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
	  return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	// istanbul ignore next

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _base = __webpack_require__(1);

	var _base2 = _interopRequireDefault(_base);

	var patchDiff = new _base2['default']();
	exports.patchDiff = patchDiff;
	patchDiff.tokenize = function (value) {
	  var ret = [],
	      linesAndNewlines = value.split(/(\n|\r\n)/);

	  // Ignore the final empty token that occurs if the string ends with a new line
	  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
	    linesAndNewlines.pop();
	  }

	  // Merge the content and line separators into single tokens
	  for (var i = 0; i < linesAndNewlines.length; i++) {
	    var line = linesAndNewlines[i];

	    if (i % 2) {
	      ret[ret.length - 1] += line;
	    } else {
	      ret.push(line);
	    }
	  }
	  return ret;
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	// See: http://code.google.com/p/google-diff-match-patch/wiki/API
	"use strict";

	exports.__esModule = true;
	exports.convertChangesToDMP = convertChangesToDMP;

	function convertChangesToDMP(changes) {
	  var ret = [],
	      change = undefined,
	      operation = undefined;
	  for (var i = 0; i < changes.length; i++) {
	    change = changes[i];
	    if (change.added) {
	      operation = 1;
	    } else if (change.removed) {
	      operation = -1;
	    } else {
	      operation = 0;
	    }

	    ret.push([operation, change.value]);
	  }
	  return ret;
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.convertChangesToXML = convertChangesToXML;

	function convertChangesToXML(changes) {
	  var ret = [];
	  for (var i = 0; i < changes.length; i++) {
	    var change = changes[i];
	    if (change.added) {
	      ret.push('<ins>');
	    } else if (change.removed) {
	      ret.push('<del>');
	    }

	    ret.push(escapeHTML(change.value));

	    if (change.added) {
	      ret.push('</ins>');
	    } else if (change.removed) {
	      ret.push('</del>');
	    }
	  }
	  return ret.join('');
	}

	function escapeHTML(s) {
	  var n = s;
	  n = n.replace(/&/g, '&amp;');
	  n = n.replace(/</g, '&lt;');
	  n = n.replace(/>/g, '&gt;');
	  n = n.replace(/"/g, '&quot;');

	  return n;
	}


/***/ }
/******/ ])
});
;
function generateOptions(options, defaults) {
  if (typeof options === 'function') {
    defaults.callback = options;
  } else if (options) {
    for (let name in options) {
      /* istanbul ignore else */
      if (options.hasOwnProperty(name)) {
        defaults[name] = options[name];
      }
    }
  }
  return defaults;
}
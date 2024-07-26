# mocha-froth

[![npm version](https://badge.fury.io/js/mocha-froth.svg)](https://www.npmjs.com/package/mocha-froth)
[![Travis Build Status](https://travis-ci.org/keith24/mocha-froth.svg?branch=master)](https://travis-ci.org/keith24/mocha-froth)
[![Coverage Status](https://coveralls.io/repos/github/keith24/mocha-froth/badge.svg?branch=master)](https://coveralls.io/github/keith24/mocha-froth?branch=master)
[![Snyk Vulnerabilities](https://snyk.io/test/github/keith24/mocha-froth/badge.svg?targetFile=package.json)](https://snyk.io/test/github/keith24/mocha-froth?targetFile=package.json)

Fuzzer for mocha testing.  Or any javascript testing suite, really.  This package provides a function that returns an array of random strings.  You know, a [fuzzer](https://en.wikipedia.org/wiki/Fuzzer).  


## Installation

```sh
npm install --save-dev mocha-froth
```


## Usage

Import froth into your project

```javascript
const froth = require('mocha-froth')
```

Use the syntax `froth(num, max, opt)`where:

* *num* is the number of strings generated
* *max* is the maximum string length
* *opt* is an object of options for characters to include

```javascript
opt = {
  // Set to true to include tests with...
  none: true, // Empty string
  whitespace: true, // Various whitespace chars
  quotes: true, // Combinations of quotes
  backslashing: true, // Combinations of backslashes
  symbols: true, // Various symbols
  foreign: true, // Foreign chars
  alphanumeric: true, // Ordinary letters and numbers
}
```

mocha-froth will return an array of strings you can use to test your code.  


### Examples

Create ten random strings, each up to twenty characters (default): 

```javascript
console.log( froth() )
// [ '``8\\ёðNàЧ,', 'µ', '\\,нcy', '?O¬ìè¶ſ\r4á%"Е~', '', 'ИôAàяjùgzH%хйf', 'd\r\nïЧо', '«&pcj→ъгPfЬа|h', 'ñgMſииe&?“3ьXî¢òдq<ц', 'Un5tĸ' ]
```

Create five strings up to ten characters: 

```javascript
console.log( froth(5,10) )
// [ '¢m\'\'\'ý7\'', 'óé€с-', 'фяþnЭOо', '', 'ykUбáФ¿ŷ¢С' ]
```

Same as above, but without foreign characters: 

```javascript
console.log( froth(5,10,{foreign:false}) )
// [ 'VP"""t¬mK²', '²L6)>\r\nV', 'v,→“', '*e8', '→' ]
```


## Testing

```sh
npm test
```

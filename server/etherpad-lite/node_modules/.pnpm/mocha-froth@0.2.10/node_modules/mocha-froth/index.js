'use strict'

/**
 * Returns an array of random strings for fuzzing
 * @param {number} num: number of test strings to return
 * @param {number} max: maximum length of test string
 * @param {object} opt: options
 * @return {array}
 */
module.exports = function(num=10, max=20, opt={
  // Set to true to include tests with...
  none: true, // Empty string
  whitespace: true, // Various whitespace chars
  quotes: true, // Combinations of quotes
  backslashing: true, // Combinations of backslashes
  symbols: true, // Various symbols
  foreign: true, // Foreign chars
  alphanumeric: true, // Ordinary letters and numbers
} ){
  
  let chars = []
  let tests = []
  
  // Whitespace characters
  if (opt.whitespace!==false) chars = chars.concat([
    ' ', // Space
    '  ', // Tab
    '\n', // Newline
    '\r', // Return
    '\r\n', // Carrage return
  ])
  
  // Quotation characters
  if (opt.quotes!==false) chars = chars.concat([
    '\'', '\'\'', '\'\'\'', // Single quotes
    '"', '""', '"""', // Double quotes
    '`', '``', '```', // Backticks
  ])
  
  // Backslashes
  if (opt.backslashing!==false) chars = chars.concat([
    '\\', '\\\\',
  ])
  
  // Symbols
  if (opt.symbols!==false) chars = chars.concat(
    '°~!@#$%€^&*()-_─=+[]{}|;:,./<>?¿¹²³¼½¬€¶←↓→»«¢„“”·…–'.split('')
  )
  
  // Foreign characters
  if (opt.foreign!==false) chars = chars.concat(
    'ŧłßöäüñáóíúýéâêîôûŷàèìòùảẻỉỏỷÿïøþłĸŋđðſæµёйцукенгшщзхъэждлорпавыфячсмитьбюЁЙЦУКЕНГШЩЗХЪЭЖДЛОРПАВЫФЯЧСМИТЬБЮ'.split('')
  )
  
  // Ordinary letters and numbers
  if (opt.alphanumeric!==false) chars = chars.concat(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
  )
  
  // Set minimum string length
  const min = (opt.none!==false)? 0 : 1
  
  // Add tests until we have enough tests
  while (tests.length<num) {
    
    // Pick a random number from min to max
    const len = Math.floor(Math.random() * (max - min + 1)) + min
    
    // Create a string of that length
    let s = ''
    while (s.length<len) {
      s += chars[Math.floor(Math.random()*chars.length)]
    }
    
    // Make sure we didn't go over the max length
    // (some chars have multiple characters)
    while (s.length>len) s = s.substring(1)
    
    // Add that string to the tests if not already
    if (!tests.includes(s)) tests.push(s)
    
  }
  
  return tests
  
}

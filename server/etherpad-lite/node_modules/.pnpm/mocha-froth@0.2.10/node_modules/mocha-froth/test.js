'use strict'

const expect = require('chai').expect
const froth = require('./index')

describe('Default settings', () => {
  
  it('should return a 10-item array of strings with 20 characters or less by default', () => {
    const output = froth()
    expect(output).to.be.an('array').and.to.have.lengthOf(10)
    output.forEach( (item) => {
      expect(item).to.be.a('string').and.not.to.have.lengthOf.above(20)
    })
  })
  
})

describe('Changing number of strings and maximum length', () => {
  
  it('should return a different number of strings', () => {
    // Generate a random number from 1 to 50
    const test_num = Math.floor(Math.random()*51)
    const output = froth(test_num)
    expect(output).to.be.an('array').and.to.have.lengthOf(test_num)
    output.forEach( (item) => {
      expect(item).to.be.a('string').and.not.to.have.lengthOf.above(20)
    })
  })
  
  it('should return strings with a different maximum length', () => {
    // Generate a random number from 1 to 50
    const test_max = Math.floor(Math.random()*51)
    const output = froth(undefined, test_max)
    expect(output).to.be.an('array').and.to.have.lengthOf(10)
    output.forEach( (item) => {
      expect(item).to.be.a('string').and.not.to.have.lengthOf.above(test_max)
    })
  })
  
  it('should return a different number of strings with a different maximum length', () => {
    // Generate two random number from 1 to 50
    const test_num = Math.floor(Math.random()*51)
    const test_max = Math.floor(Math.random()*51)
    const output = froth(test_num, test_max)
    expect(output).to.be.an('array').and.to.have.lengthOf(test_num)
    output.forEach( (item) => {
      expect(item).to.be.a('string').and.not.to.have.lengthOf.above(test_max)
    })
  })
  
})

describe('Changing options', () => {
  
  it('should not return blank strings when \'none=false\' is specified', () => {
    const output = froth(100, 100, {none:false})
    expect(output).to.be.an('array').and.to.not.contain('')
  })
  
  it('should not return whitespaces when \'whitespace=false\' is specified', () => {
    const output = froth(100, 100, {whitespace:false})
    expect(output).to.be.an('array').and.to.not.contain(' ','  ','\n','\r\n','\r')
  })
  
  it('should not return quotations when \'quotes=false\' is specified', () => {
    const output = froth(100, 100, {quotes:false})
    expect(output).to.be.an('array').and.to.not.contain(
      '\'', '\'\'', '\'\'\'', '"', '""', '"""', '`', '``', '```'
    )
  })
  
  it('should not return symbols when \'symbols=false\' is specified', () => {
    const output = froth(100, 100, {quotes:false})
    expect(output).to.be.an('array').and.to.not.contain(
      ...'°~!@#$%€^&*()-_─=+[]{}|;:,./<>?¿¹²³¼½¬€¶←↓→»«¢„“”·…–'.split('')
    )
  })
  
  it('should not return foreign characters when \'foreign=false\' is specified', () => {
    const output = froth(100, 100, {quotes:false})
    expect(output).to.be.an('array').and.to.not.contain(
      ...'ŧłßöäüñáóíúýéâêîôûŷàèìòùảẻỉỏỷÿïøþłĸŋđðſæµёйцукенгшщзхъэждлорпавыфячсмитьбюЁЙЦУКЕНГШЩЗХЪЭЖДЛОРПАВЫФЯЧСМИТЬБЮ'.split('')
    )
  })
  
  it('should not return numbers or letters when \'alphanumeric=false\' is specified', () => {
    const output = froth(100, 100, {quotes:false})
    expect(output).to.be.an('array').and.to.not.contain(
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
    )
  })
  
})

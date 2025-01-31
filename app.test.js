
const { expect } = require('@jest/globals');
const { validateEmail } = require('./auth-utils');



test("Should reject empty inputs", ()=>{
    let input = "";
    let result = validateEmail(input);
    expect(result).toBe(false)
})
test("should reject emails without the @ sign", ()=>{
    let input ="briankyalo@gmail.com"
    let result = validateEmail(input)
    expect(result).toBe(true)
})

test("Should deny emails with spaces", () => {
    let input = "Ivo nne@gmail.com"
    let result = validateEmail(input)
    expect(result).toBe(false)
})

test("Should deny emails without text before @ spaces", () => {
    let input = "@.Com"
    let result = validateEmail(input)
    expect(result).toBe(false)
})



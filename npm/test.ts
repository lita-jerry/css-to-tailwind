import assert from 'assert'
import { CssToTailwindTranslator } from './CssToTailwindTranslator.js'

const sample = `.a {
height: 28rpx;
font-weight: 400;
font-size: 20rpx;
color: #3F16FF;
line-height: 28rpx;
}`

const always = CssToTailwindTranslator(sample, {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'always'
})
const alwaysVal = always.data[0].resultVal
assert.ok(alwaysVal.includes('h-[28rpx]'), alwaysVal)
assert.ok(alwaysVal.includes('font-[400]'), alwaysVal)
assert.ok(alwaysVal.includes('text-[20rpx]'), alwaysVal)
assert.ok(alwaysVal.includes('text-[#3F16FF]'), alwaysVal)
assert.ok(alwaysVal.includes('leading-[28rpx]'), alwaysVal)

const smart = CssToTailwindTranslator(sample, {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'smart'
})
const smartVal = smart.data[0].resultVal
assert.ok(smartVal.includes('h-28rpx'), smartVal)
assert.ok(smartVal.includes('font-400'), smartVal)
assert.ok(smartVal.includes('text-20rpx'), smartVal)
assert.ok(smartVal.includes('text-#3F16FF'), smartVal)
assert.ok(smartVal.includes('leading-28rpx'), smartVal)

const hexBorder = CssToTailwindTranslator('.z { border-color: #979797; }', {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'smart'
})
assert.ok(hexBorder.data[0].resultVal.includes('border-#979797'), hexBorder.data[0].resultVal)

const calcCss = `.b { line-height: calc(100% - 2px); }`
const calcR = CssToTailwindTranslator(calcCss, {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'smart'
})
const calcVal = calcR.data[0].resultVal
assert.ok(
  calcVal.includes('leading-[calc(') && calcVal.includes('2px)]'),
  calcVal
)

const apCss = `.c { animation-delay: 1s; }`
const apR = CssToTailwindTranslator(apCss, {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'smart'
})
const apVal = apR.data[0].resultVal
assert.ok(apVal.includes('[animation-delay:1s]'), apVal)

const urlCss = `.d { background-image: url(a.png); }`
const urlR = CssToTailwindTranslator(urlCss, {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'smart'
})
const urlVal = urlR.data[0].resultVal
assert.ok(urlVal.includes('bg-[url(a.png)]'), urlVal)

const never = CssToTailwindTranslator(sample, {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'never'
})
const neverVal = never.data[0].resultVal
assert.ok(neverVal.includes('text-#3F16FF'), neverVal)

const mediaCss = `@media (min-width: 768px) { .x { width: 10px; } }`
const mediaR = CssToTailwindTranslator(mediaCss, { useAllDefaultValues: false })
assert.strictEqual(mediaR.code, 'OK')

const plain = CssToTailwindTranslator('.__inline__ { height: 28rpx; }', {
  useAllDefaultValues: false,
  arbitraryValueBrackets: 'always'
})
assert.ok(plain.data[0].resultVal.includes('h-[28rpx]'), plain.data[0].resultVal)

const gradCss =
  '.g { background: linear-gradient( 180deg, #FFE612 0%, #FFC808 100%); }'
const gradR = CssToTailwindTranslator(gradCss, { useAllDefaultValues: false })
const gv = gradR.data[0].resultVal
assert.ok(gv.includes('bg-[linear-gradient(180deg,#FFE612_0%,#FFC808_100%)]'), gv)
assert.ok(!gv.includes('linear-gradient(_180deg'), gv)

console.log('translator regression tests passed')

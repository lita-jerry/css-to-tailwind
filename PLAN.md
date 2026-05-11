# CSS To Tailwind Small-Scope Reliability Update

## Summary
- Keep the current output as the safe default, then add an explicit bracket strategy so your project can opt into bracketless simple values without breaking Tailwind-standard cases.
- Make result copying happen by clicking the generated code block itself, removing the separate copy button.
- Accept plain declaration input like `height: 28rpx; font-weight: 400;` by normalizing it before translation instead of rewriting the parser.
- Add an optional UI-only DOM wrapper tag so copied/displayed output can become `<div class="..."></div>` while the translator API stays class-string-based.

## Implementation Changes
- In `npm/CssToTailwindTranslator.ts`, add `TranslatorConfig.arbitraryValueBrackets?: 'always' | 'smart' | 'never'` with default `'always'`.
- Apply bracket formatting in one token post-processing step inside `getResultCode`, immediately after the property mapper returns utility tokens and before prefix / important / pseudo-state / media prefix handling.
- Bracket rules:
  - `always`: preserve current behavior exactly.
  - `smart`: strip outer `[...]` for numeric or numeric+unit atoms (`400`, `28rpx`, …) and for **plain hex** inners only (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, e.g. `text-#3F16FF`).
  - `never`: strip when inner is a simple atom without risky syntax; plain hex allowed; still never strip arbitrary-property tokens.
- Always keep brackets for:
  - Arbitrary properties like `[mask-type:luminance]`, `[animation-delay:1s]`, `[--scroll-offset:56px]`
  - Values containing whitespace, `_`-as-space, `(`, `)`, `,`, `'`, `"`, `/`, `:`, `var(`, `calc(`, gradients, URLs, type hints, or any `#` usage that is **not** a plain hex literal as above
- In `pages/index.tsx`, stop importing the published package name for the web app and point the page at the repo-local translator source so local translator changes are reflected immediately.
- In `pages/index.tsx`, add a small pre-normalizer:
  - If the trimmed input has no `{` / `}` and parses as a declaration list, wrap it as a temporary selector block like `.__inline__ { ... }`
  - If braces are present, keep the current parser flow unchanged
- In `components/ResultSection.tsx`, remove the standalone copy button and make the rendered result code block itself a clickable, keyboard-accessible button-like element that calls the existing copy helper.
- Add a UI-only `wrapperTag` config field in page state, default `''`:
  - Empty string means disabled
  - Non-empty value must match a simple tag-name regex like `^[a-z][a-z0-9-]*$`
  - When valid, displayed/copied output becomes `<tag class="..."></tag>`
  - When invalid, fall back to raw class output instead of emitting unsafe HTML
- Keep `wrapperTag` out of the translator API per your choice; it only affects page rendering/copy formatting.
- Merge saved localStorage config with defaults on load so old saved configs remain usable when new fields are introduced.
- Update docs:
  - Root / npm README for `arbitraryValueBrackets`
  - Page config UI labels/placeholders to explain `wrapperTag` and bracket strategy

## Public API / Interface Changes
- `TranslatorConfig` gains:
  - `arbitraryValueBrackets?: 'always' | 'smart' | 'never'`
- Web-page-only config state gains:
  - `wrapperTag: string` where empty means “no DOM wrapper”
- No change to translator return shape:
  - `resultVal` remains a class string
  - DOM wrapper formatting is only applied in the page layer

## Test Plan
- Translator regression cases:
  - Default mode keeps `h-[28rpx] font-[400] text-[20rpx]`
  - `smart` converts simple atoms to `h-28rpx font-400 text-20rpx`
  - `smart` strips plain hex to `text-#3F16FF`, still keeps `leading-[calc(100%-2px)]`, `bg-[url(...)]`, `[mask-type:luminance]`
  - `never` strips only single-atom arbitrary utilities and still preserves arbitrary-property tokens
- Input normalization cases:
  - Plain declaration input translates successfully
  - Existing `.a { ... }` input remains unchanged
  - Existing `@media { ... }` input remains unchanged
- UI cases:
  - Clicking the code block copies output and still shows success/error toast
  - With `wrapperTag='div'`, copied/displayed output is wrapped HTML
  - Invalid `wrapperTag` falls back to raw class output
  - Old localStorage config loads without crashing and fills new defaults

## Assumptions and Defaults
- Default bracket mode stays conservative as `'always'` to avoid regressions.
- `wrapperTag` affects only page display/copy, not npm consumers.
- Raw input compatibility is limited to a pure top-level declaration list; mixed “raw declarations + selector blocks” is out of scope for this change.
- Bracket-keeping policy is based on Tailwind’s official arbitrary value/property docs, which still document bracket syntax as the standard form:
  - [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)
  - [font-size](https://tailwindcss.com/docs/font-size)
  - [font-weight](https://tailwindcss.com/docs/font-weight)

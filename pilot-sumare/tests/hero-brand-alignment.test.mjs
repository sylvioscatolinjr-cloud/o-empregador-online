import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('desktop circular brand starts at the top and retains mobile stacking',()=>{
 const css=readFileSync(new URL('../app/home.css',import.meta.url),'utf8');
 assert.match(css,/@media\(min-width:651px\)\{\.public-home \.home-hero>\.hero-art\{align-self:start\}\}/);
 assert.ok(css.includes('max-width:360px;margin:16px auto 0'));
});

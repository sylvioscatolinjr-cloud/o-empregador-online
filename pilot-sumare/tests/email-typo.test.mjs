import {test} from 'node:test';
import assert from 'node:assert/strict';
import {suggestEmailCorrection} from '../src/email-typo.mjs';
test('suggests common provider domains for small typos',()=>{assert.equal(suggestEmailCorrection('Pessoa@gmial.com'),'pessoa@gmail.com');assert.equal(suggestEmailCorrection('a@hotmal.com'),'a@hotmail.com');assert.equal(suggestEmailCorrection('a@gmail.con'),'a@gmail.com');assert.equal(suggestEmailCorrection('a@yaho.com.br'),'a@yahoo.com.br');});
test('keeps correct, unknown or malformed addresses untouched',()=>{assert.equal(suggestEmailCorrection('a@gmail.com'),null);assert.equal(suggestEmailCorrection('a@hotmail.com.br'),null);assert.equal(suggestEmailCorrection('a@empresa-xyz.com.br'),null);assert.equal(suggestEmailCorrection('sem-arroba'),null);assert.equal(suggestEmailCorrection('@gmail.com'),null);});

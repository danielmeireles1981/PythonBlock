import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordHash,passwordMatches,normalizeUsername,requireOrigin,safeFilename } from '../lib/security';
process.env.AUTH_SECRET='test-secret-that-is-long-enough-and-not-a-real-secret';
test('PINs are salted and compared using the server secret',async()=>{const a=await passwordHash('0123'),b=await passwordHash('0123');assert.notEqual(a,b);assert.equal(await passwordMatches('0123',a),true);assert.equal(await passwordMatches('1230',a),false);process.env.AUTH_SECRET='another-long-secret-used-only-for-automated-tests';assert.equal(await passwordMatches('0123',a),false)});
test('cross-origin writes are rejected',()=>{process.env.APP_ORIGIN='https://pythonblock.example';requireOrigin(new Request('https://pythonblock.example/api/me',{headers:{origin:'https://pythonblock.example'}}));assert.throws(()=>requireOrigin(new Request('https://pythonblock.example/api/me',{headers:{origin:'null'}})));assert.throws(()=>requireOrigin(new Request('https://pythonblock.example/api/me')))});
test('file names cannot escape the workspace',()=>{assert.equal(safeFilename('main.py'),true);for(const name of ['../main.py','/etc/passwd','data/secret.py','test.html','a..py'])assert.equal(safeFilename(name),false)});
test('user names are normalized consistently',()=>assert.equal(normalizeUsername('  ALUNO.1  '),'aluno.1'));

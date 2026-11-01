/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validateConfirm,
  validateEmail,
  validateName,
  validatePassword,
  validateRequired,
} from './validators';

describe('validateEmail', () => {
  it('requires a value', () => {
    assert.equal(validateEmail(''), 'Email is required');
    assert.equal(validateEmail('   '), 'Email is required');
  });
  it('rejects malformed emails', () => {
    assert.equal(validateEmail('nope'), 'Enter a valid email');
    assert.equal(validateEmail('a@b'), 'Enter a valid email');
  });
  it('accepts valid emails (trimmed)', () => {
    assert.equal(validateEmail('a@b.com'), null);
    assert.equal(validateEmail('  a@b.com  '), null);
  });
});

describe('validatePassword', () => {
  it('requires a value', () => {
    assert.equal(validatePassword(''), 'Password is required');
  });
  it('requires at least 8 characters', () => {
    assert.equal(validatePassword('abc123'), 'Use at least 8 characters');
  });
  it('requires letters and numbers', () => {
    assert.equal(validatePassword('abcdefgh'), 'Use letters and numbers');
    assert.equal(validatePassword('12345678'), 'Use letters and numbers');
  });
  it('accepts a strong password', () => {
    assert.equal(validatePassword('abc12345'), null);
  });
});

describe('validateName / validateRequired', () => {
  it('validates names', () => {
    assert.equal(validateName(''), 'Name is required');
    assert.equal(validateName('A'), 'Name is too short');
    assert.equal(validateName('Mo'), null);
  });
  it('builds a labelled required validator', () => {
    assert.equal(validateRequired('Title')('  '), 'Title is required');
    assert.equal(validateRequired('Title')('x'), null);
  });
});

describe('validateConfirm', () => {
  it('compares with the current password', () => {
    const check = validateConfirm(() => 'abc12345');
    assert.equal(check(''), 'Please confirm your password');
    assert.equal(check('different1'), 'Passwords do not match');
    assert.equal(check('abc12345'), null);
  });
});
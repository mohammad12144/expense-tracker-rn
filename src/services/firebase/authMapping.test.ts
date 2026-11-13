/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { authErrorMessage, toAuthUser } from './authMapping';

describe('toAuthUser', () => {
  it('uses the display name when there is one', () => {
    assert.deepEqual(toAuthUser({ uid: 'u1', displayName: ' Mo ', email: 'mo@example.com' }), {
      id: 'u1',
      name: 'Mo',
      email: 'mo@example.com',
    });
  });
  it('falls back to the email prefix, then to "User"', () => {
    assert.equal(toAuthUser({ uid: 'u1', displayName: null, email: 'mo@example.com' }).name, 'mo');
    assert.equal(toAuthUser({ uid: 'u1', displayName: '', email: 'x@y.com' }).name, 'x');
    assert.equal(toAuthUser({ uid: 'u1', displayName: null, email: null }).name, 'User');
  });
});

describe('authErrorMessage', () => {
  it('maps the common Firebase codes', () => {
    assert.equal(authErrorMessage({ code: 'auth/invalid-credential' }), 'Incorrect email or password');
    assert.equal(authErrorMessage({ code: 'auth/wrong-password' }), 'Incorrect email or password');
    assert.equal(authErrorMessage({ code: 'auth/user-not-found' }), 'Incorrect email or password');
    assert.equal(authErrorMessage({ code: 'auth/email-already-in-use' }), 'This email is already registered');
    assert.match(authErrorMessage({ code: 'auth/weak-password' }), /too weak/);
    assert.match(authErrorMessage({ code: 'auth/network-request-failed' }), /internet/);
    assert.match(authErrorMessage({ code: 'auth/too-many-requests' }), /Too many/);
  });
  it('never leaks raw errors for unknown input', () => {
    for (const bad of [new Error('secret internal text'), { code: 'auth/something-new' }, null, undefined, 'x']) {
      assert.equal(authErrorMessage(bad), 'Something went wrong. Please try again');
    }
  });
});
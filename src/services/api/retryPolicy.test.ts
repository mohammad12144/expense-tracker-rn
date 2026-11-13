/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from './ApiError';
import { MAX_RETRIES, retryDelay, shouldRetry } from './retryPolicy';

describe('shouldRetry', () => {
  it('retries network errors, timeouts and 5xx', () => {
    assert.equal(shouldRetry(0, new ApiError('network')), true);
    assert.equal(shouldRetry(1, new ApiError('timeout')), true);
    assert.equal(shouldRetry(0, new ApiError('http', 500)), true);
    assert.equal(shouldRetry(0, new ApiError('http', 503)), true);
  });
  it('does not retry client errors, bad responses or cancellations', () => {
    assert.equal(shouldRetry(0, new ApiError('http', 404)), false);
    assert.equal(shouldRetry(0, new ApiError('http', 401)), false);
    assert.equal(shouldRetry(0, new ApiError('parse')), false);
    assert.equal(shouldRetry(0, new ApiError('cancelled')), false);
  });
  it('stops after the maximum number of retries', () => {
    assert.equal(shouldRetry(MAX_RETRIES, new ApiError('network')), false);
  });
  it('does not retry unknown errors', () => {
    assert.equal(shouldRetry(0, new Error('boom')), false);
  });
});

describe('retryDelay', () => {
  it('doubles each time and is capped at 8 seconds', () => {
    assert.deepEqual([0, 1, 2, 3, 4, 10].map(retryDelay), [1000, 2000, 4000, 8000, 8000, 8000]);
  });
});
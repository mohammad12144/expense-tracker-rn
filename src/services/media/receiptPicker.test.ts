/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ImagePickerLike, pickProblemMessage, pickReceipt } from './receiptPicker';

type Picked = { canceled: boolean; uri?: string };

function fakePicker(
  opts: {
    granted?: boolean;
    canAskAgain?: boolean;
    camera?: Picked;
    library?: Picked;
    throwOnLaunch?: boolean;
  } = {},
) {
  const calls: string[] = [];
  const picker: ImagePickerLike = {
    requestCameraPermission: async () => {
      calls.push('permission');
      return { granted: opts.granted ?? true, canAskAgain: opts.canAskAgain ?? true };
    },
    launchCamera: async () => {
      calls.push('camera');
      if (opts.throwOnLaunch) throw new Error('boom');
      return opts.camera ?? { canceled: false, uri: 'file://camera.jpg' };
    },
    launchLibrary: async () => {
      calls.push('library');
      if (opts.throwOnLaunch) throw new Error('boom');
      return opts.library ?? { canceled: false, uri: 'file://library.jpg' };
    },
  };
  return { picker, calls };
}

describe('pickReceipt (camera)', () => {
  it('asks for permission first, then opens the camera', async () => {
    const { picker, calls } = fakePicker();
    assert.deepEqual(await pickReceipt('camera', picker), { kind: 'picked', uri: 'file://camera.jpg' });
    assert.deepEqual(calls, ['permission', 'camera']);
  });
  it('does not open the camera when permission is refused', async () => {
    const { picker, calls } = fakePicker({ granted: false, canAskAgain: true });
    assert.deepEqual(await pickReceipt('camera', picker), { kind: 'denied', canAskAgain: true });
    assert.deepEqual(calls, ['permission']);
  });
  it('reports a permanent refusal (must use Settings)', async () => {
    const { picker } = fakePicker({ granted: false, canAskAgain: false });
    assert.deepEqual(await pickReceipt('camera', picker), { kind: 'denied', canAskAgain: false });
  });
  it('handles the user closing the camera', async () => {
    const { picker } = fakePicker({ camera: { canceled: true } });
    assert.deepEqual(await pickReceipt('camera', picker), { kind: 'cancelled' });
  });
});

describe('pickReceipt (library)', () => {
  it('needs no permission prompt', async () => {
    const { picker, calls } = fakePicker({ granted: false });
    assert.deepEqual(await pickReceipt('library', picker), { kind: 'picked', uri: 'file://library.jpg' });
    assert.deepEqual(calls, ['library']);
  });
  it('handles cancel', async () => {
    const { picker } = fakePicker({ library: { canceled: true } });
    assert.deepEqual(await pickReceipt('library', picker), { kind: 'cancelled' });
  });
  it('treats a result without a uri as a failure', async () => {
    const { picker } = fakePicker({ library: { canceled: false } });
    assert.deepEqual(await pickReceipt('library', picker), { kind: 'failed' });
  });
  it('turns a crash in the picker into a failure instead of throwing', async () => {
    const { picker } = fakePicker({ throwOnLaunch: true });
    assert.deepEqual(await pickReceipt('library', picker), { kind: 'failed' });
    assert.deepEqual(await pickReceipt('camera', picker), { kind: 'failed' });
  });
});

describe('pickProblemMessage', () => {
  it('says nothing for a photo or a cancel', () => {
    assert.equal(pickProblemMessage({ kind: 'picked', uri: 'x' }), null);
    assert.equal(pickProblemMessage({ kind: 'cancelled' }), null);
  });
  it('explains a refusal differently when Settings is the only way', () => {
    const again = pickProblemMessage({ kind: 'denied', canAskAgain: true });
    const settings = pickProblemMessage({ kind: 'denied', canAskAgain: false });
    assert.match(again ?? '', /Camera access is needed/);
    assert.match(settings ?? '', /Settings/);
  });
  it('has a message for failures', () => {
    assert.match(pickProblemMessage({ kind: 'failed' }) ?? '', /try again/);
  });
});
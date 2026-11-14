/** Where a receipt photo comes from. */
export type ReceiptSource = 'camera' | 'library';

/** The small part of expo-image-picker this feature needs. Tests pass a fake one. */
export interface ImagePickerLike {
  requestCameraPermission: () => Promise<{ granted: boolean; canAskAgain: boolean }>;
  launchCamera: () => Promise<{ canceled: boolean; uri?: string }>;
  launchLibrary: () => Promise<{ canceled: boolean; uri?: string }>;
}

export type PickResult =
  | { kind: 'picked'; uri: string }
  | { kind: 'cancelled' }
  /** canAskAgain false means the system will not show the prompt again: the user must use Settings. */
  | { kind: 'denied'; canAskAgain: boolean }
  | { kind: 'failed' };

/**
 * Gets a photo for a receipt.
 * - Camera: asks for the camera permission first (and says clearly when it is refused).
 * - Library: the system photo picker needs no permission, because the user chooses the photo.
 */
export async function pickReceipt(
  source: ReceiptSource,
  picker: ImagePickerLike,
): Promise<PickResult> {
  try {
    if (source === 'camera') {
      const permission = await picker.requestCameraPermission();
      if (!permission.granted) return { kind: 'denied', canAskAgain: permission.canAskAgain };
    }
    const result = source === 'camera' ? await picker.launchCamera() : await picker.launchLibrary();
    if (result.canceled) return { kind: 'cancelled' };
    return result.uri ? { kind: 'picked', uri: result.uri } : { kind: 'failed' };
  } catch {
    return { kind: 'failed' };
  }
}

/** Text for the user when a pick did not give a photo. Returns null when nothing needs saying. */
export function pickProblemMessage(result: PickResult): string | null {
  switch (result.kind) {
    case 'denied':
      return result.canAskAgain
        ? 'Camera access is needed to take a photo. You can still choose one from your gallery.'
        : 'Camera access is turned off. Enable it in Settings, or choose a photo from your gallery.';
    case 'failed':
      return 'Could not get the photo. Please try again.';
    case 'picked':
    case 'cancelled':
      return null;
  }
}
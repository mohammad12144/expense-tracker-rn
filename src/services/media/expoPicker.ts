import * as ImagePicker from 'expo-image-picker';
import { ImagePickerLike } from './receiptPicker';

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.7, // smaller files, still readable receipts
};

const firstUri = (result: ImagePicker.ImagePickerResult) => ({
  canceled: result.canceled,
  uri: result.assets?.[0]?.uri,
});

/** The real picker: camera and photo library through expo-image-picker. */
export const expoPicker: ImagePickerLike = {
  requestCameraPermission: async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    return { granted: p.granted, canAskAgain: p.canAskAgain };
  },
  launchCamera: async () => firstUri(await ImagePicker.launchCameraAsync(OPTIONS)),
  launchLibrary: async () => firstUri(await ImagePicker.launchImageLibraryAsync(OPTIONS)),
};
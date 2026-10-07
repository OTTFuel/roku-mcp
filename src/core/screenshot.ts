/** Detect the actual screenshot format, independently of its URL. */
export function screenshotMimeType(image: Buffer): 'image/png' | 'image/jpeg' {
  if (image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return 'image/png';
  }
  if (image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff) {
    return 'image/jpeg';
  }
  throw new Error('Screenshot response is not a PNG or JPEG image');
}

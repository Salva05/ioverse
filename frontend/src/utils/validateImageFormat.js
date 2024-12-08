/**
 * Helper function that checks whether the URL of
 * a picture is among the ones supported by OpenAI Assistant API
 * for Message object with image_url creation, or is a DALL-E generated image.
 *
 * @param {string} url - The URL of the picture to check.
 * @returns {boolean} - Returns true if the URL is valid, false otherwise.
 */
function isSupportedImageUrl(url) {
  // Allow all DALL-E generated images
  if (url.includes("oaidalleapiprodscus")) {
    return true;
  }
  const supportedFormats = [".jpeg", ".jpg", ".gif", ".png"];
  const fileExtension = url.split(".").pop().toLowerCase();
  return supportedFormats.some((format) => `.${fileExtension}` === format);
}

export default isSupportedImageUrl;

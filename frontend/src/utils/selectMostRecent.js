/**
 * Given an array of objects with a "created_at" property,
 * this function will return the one with the most recent creation time.
 *
 * @param {Array} items - An array of objects, each with a "created_at" key.
 * @returns {Object|undefined} The item with the most recent "created_at" value, or undefined if array is empty.
 */
export default function selectMostRecent(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return undefined;
  }

  let mostRecent = items[0];

  for (let i = 1; i < items.length; i++) {
    if (items[i].created_at > mostRecent.created_at) {
      mostRecent = items[i];
    }
  }

  return mostRecent;
}

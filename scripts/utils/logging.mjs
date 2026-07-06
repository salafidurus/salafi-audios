let currentPrefix = "[Scripts]";

/**
 * Configure the active prefix/category name for logging.
 * @param {string} prefix The prefix label (e.g. "[Deploy]", "[Postinstall]").
 */
export function setPrefix(prefix) {
  currentPrefix = prefix;
}

export function log(message) {
  console.log(`\x1b[36m${currentPrefix}\x1b[0m ${message}`);
}

export function success(message) {
  console.log(`\x1b[32m${currentPrefix} Success:\x1b[0m ${message}`);
}

export function warn(message) {
  console.warn(`\x1b[33m${currentPrefix} Warning:\x1b[0m ${message}`);
}

export function error(message) {
  console.error(`\x1b[31m${currentPrefix} Error:\x1b[0m ${message}`);
}

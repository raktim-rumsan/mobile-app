export function isValidString(
  input: string,
  allowedChars: string = '',
): boolean {
  // Construct the regular expression pattern with additional characters
  const regexPattern = `^[a-zA-Z0-9_\\-${allowedChars}]+$`;

  // Create the regular expression with the constructed pattern
  const regex = new RegExp(regexPattern);

  // Test the input against the regular expression
  return regex.test(input);
}

export function stringToArray(value: string | string[]): string[] {
  if (typeof value === 'string') {
    return value.split(',').map((v) => v.trim());
  } else if (Array.isArray(value)) {
    return value.map((v) => v.trim());
  } else {
    return [];
  }
}

/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */
export function truncateEthAddress(address: string) {
  if (!address) return address;
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
}

export function toProperCase(str: string) {
  if (!str) return str;
  return str.replace(/\w\S*/g, function (txt: string) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

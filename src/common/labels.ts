/**
 * SQLite has no array type, so a short list of display labels is stored as one
 * delimited string. This module owns that format on both sides.
 */
const LABEL_SEPARATOR = '|';

export const splitLabels = (value: string): string[] =>
  value
    .split(LABEL_SEPARATOR)
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

export const joinLabels = (values: readonly string[]): string => values.join(LABEL_SEPARATOR);

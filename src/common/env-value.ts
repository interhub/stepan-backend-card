const DECIMAL_RADIX = 10;

/**
 * A variable that is absent and a variable set to an empty string mean the very
 * same thing here: nothing was configured, so the default wins. Serverless
 * platforms inject empty placeholders for well known names such as
 * `DATABASE_URL`, and an empty value must never take precedence over a default.
 */
export const readEnvText = (rawValue: string | undefined, fallbackValue: string): string => {
  if (rawValue === undefined) {
    return fallbackValue;
  }
  const trimmedValue = rawValue.trim();
  if (trimmedValue.length === 0) {
    return fallbackValue;
  }
  return trimmedValue;
};

export const readEnvNumber = (rawValue: string | undefined, fallbackValue: number): number => {
  const textValue = readEnvText(rawValue, '');
  if (textValue.length === 0) {
    return fallbackValue;
  }
  const parsedValue = Number.parseInt(textValue, DECIMAL_RADIX);
  if (Number.isNaN(parsedValue)) {
    return fallbackValue;
  }
  return parsedValue;
};

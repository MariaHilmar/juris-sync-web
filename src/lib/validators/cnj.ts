export const CNJ_REGEX =
  /^[0-9]{7}-[0-9]{2}\.[0-9]{4}\.[0-9]\.[0-9]{2}\.[0-9]{4}$/;

export function isValidCnj(value: string): boolean {
  return CNJ_REGEX.test(value);
}

const validTraceModes = [
  "on",
  "off",
  "on-first-retry",
  "on-all-retries",
  "retain-on-failure",
] as const;

export type TraceMode = (typeof validTraceModes)[number];

export const isValidTraceMode = (
  value: string | undefined
): value is TraceMode => {
  return !!value && validTraceModes.includes(value as TraceMode);
};

export const getTraceMode = (value: string | undefined): TraceMode => {
  return isValidTraceMode(value) ? value : "on-first-retry";
};

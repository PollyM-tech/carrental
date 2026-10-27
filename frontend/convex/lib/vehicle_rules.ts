export function nairobiToday(now = Date.now()) { return new Date(now + 10800000).toISOString().slice(0, 10); }
export function calendarDate(value: string) {
  const timestamp = Date.parse(value + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) throw new Error("Use a valid date in YYYY-MM-DD format.");
  return value;
}
export function normaliseRegistration(value: string) {
  const registration = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9-]{3,20}$/.test(registration)) throw new Error("Enter a valid vehicle registration (3–20 letters, numbers or hyphens).");
  return registration;
}
export function positiveInteger(value: number, label: string, max = 1000000000) {
  if (!Number.isSafeInteger(value) || value < 1 || value > max) throw new Error(`${label} must be a positive whole number up to ${max}.`);
  return value;
}
export function requiredText(value: string, label: string, max = 200) {
  if (!value.trim() || value.trim().length > max) throw new Error(`${label} is required (maximum ${max} characters).`);
  return value.trim();
}
export type VehicleAvailability = { archived: boolean; published: boolean; status: string; registration: string; insuranceExpiresOn?: string; inspectionExpiresOn?: string };
export type VehicleBlock = { startsOn: string; endsOn: string };
export function overlaps(start: string, end: string, otherStart: string, otherEnd: string) { return start < otherEnd && end > otherStart; }
export function availableFor(vehicle: VehicleAvailability, start: string, end: string, blocks: readonly VehicleBlock[]) {
  return !vehicle.archived && vehicle.published && vehicle.status === "available" && !!vehicle.registration && !!vehicle.insuranceExpiresOn && vehicle.insuranceExpiresOn >= end && !!vehicle.inspectionExpiresOn && vehicle.inspectionExpiresOn >= end && !blocks.some(block => overlaps(start, end, block.startsOn, block.endsOn));
}
export function catalogueReady(vehicle: VehicleAvailability, today = nairobiToday()) {
  return !vehicle.archived && vehicle.published && vehicle.status === "available" && !!vehicle.registration && !!vehicle.insuranceExpiresOn && vehicle.insuranceExpiresOn >= today && !!vehicle.inspectionExpiresOn && vehicle.inspectionExpiresOn >= today;
}
export function rentalEstimate(rate: number, days: number) {
  const total = rate * days;
  if (!Number.isSafeInteger(total) || total <= 0) throw new Error("The rental estimate is too large. Contact Movara for a quote.");
  return total;
}
export function validatePhoto(bytes: ArrayBuffer, contentType: string) {
  if (bytes.byteLength === 0 || bytes.byteLength > 2 * 1024 * 1024) throw new Error("Use a vehicle photo under 2MB after compression.");
  const b = new Uint8Array(bytes);
  const jpeg = contentType === "image/jpeg" && b[0] === 255 && b[1] === 216 && b[2] === 255;
  const png = contentType === "image/png" && [137,80,78,71,13,10,26,10].every((value, i) => b[i] === value);
  const webp = contentType === "image/webp" && b.length >= 12 && String.fromCharCode(...b.slice(0,4)) === "RIFF" && String.fromCharCode(...b.slice(8,12)) === "WEBP";
  if (!jpeg && !png && !webp) throw new Error("Upload a JPEG, PNG or WebP photo. SVG and other file types are not accepted.");
}

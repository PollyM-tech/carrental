export type RentalState = { status: string; pickupDate: string; returnDate: string; _id?: string };
export function reservedConflict(rows: RentalState[], start: string, end: string, except?: string) {
  return rows.some(row => (!except || row._id !== except) && (row.status === "overdue" || (row.status === "approved" && start < row.returnDate && end > row.pickupDate)));
}
export function canEditVerification(status: string) { return status === "requested" || status === "in_review"; }
export function requireVerificationChecks(checks: { phoneChecked: boolean; identityChecked: boolean; licenceChecked: boolean; ageChecked: boolean; licenceTenureChecked: boolean; contactsChecked: boolean }) {
  if (!Object.values(checks).every(Boolean)) throw new Error("Check original identity and licence documents, minimum age 22, two years holding a licence, the customer phone, and guarantor/next-of-kin contacts before approving.");
}
export function requireReturnOutcome(condition: string, rules: boolean, disposition: string) {
  if ((condition !== "good" || !rules) && disposition === "clear") throw new Error("For an issue, choose Flag customer or Give a second chance and record your findings.");
}

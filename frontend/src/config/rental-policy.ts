// Client decisions confirmed on 27 October 2026. Null means not yet supplied.
// These terms inform the UI; financial and handover automation is still pending.
export const rentalPolicy = {
  confirmedOn: "2026-10-27",
  depositCollection: "handover",
  paymentRequiresAllApprovals: true,
  paymentRequiresPhysicalClearance: true,
  depositAmountsByCategory: null,
  depositRefundTerms: null,
  noShowGraceMinutes: 0,
  verificationMethod: "in_person",
  onlineIdentityUploadEnabled: false,
  adminEmail: "movaracarhire@gmail.com",
  contractSigning: "manual",
  minimumDriverAge: 22,
  minimumLicenceMonths: 24,
  guarantorRequiredForAllVehicles: true,
  nextOfKinRequiredForAllVehicles: true,
  kycReviewTargetMinutes: 30,
  crossBorderAllowed: false,
  trackerProvidedBy: "vehicle_owner",
  trackerTamperAlertsRequired: true,
} as const;

export const rentalTerms = {
  payment: "Rental payment and the security deposit are collected only after all checks and approvals are complete, including physical identity/document clearance and the manually signed contract at handover. Do not pay before Movara confirms you are cleared.",
  deposit: "The security deposit is paid at vehicle handover only after you are cleared through all checks and approvals. The amount for your vehicle category and the deposit refund terms will be confirmed before you commit to the rental.",
  failedHandover: "If you fail the physical identity or document checks at handover, no rental payment or deposit is collected and the vehicle is not released. If money was paid prematurely, contact Movara for a refund under the contract: the full amount paid less transaction costs.",
  noShow: "If you miss the agreed pickup time, the vehicle is released immediately, with no grace period. Any applicable charges follow the cancellation terms in your contract. Contact Movara before pickup if you expect a delay.",
  contract: "Contracts are signed manually at handover. Cancellation deadlines and fees, insurance cover, exclusions, excess and liability for damage or theft are set out in the contract. Ask Movara to explain these terms before committing to the rental.",
  driver: "Self-drive drivers must be at least 22 and have held a licence for at least two years. Guarantor and next-of-kin contacts/details are required for every vehicle. KYC review targets 30 minutes and must be completed before handover. Additional drivers and chauffeur hire are available where applicable. Cross-border travel is unavailable.",
  pricing: "Rental pricing uses flat daily or agreed market rates confirmed before payment.",
  tracking: "GPS trackers are provided by the vehicle owners. Tamper alerts are required.",
} as const;

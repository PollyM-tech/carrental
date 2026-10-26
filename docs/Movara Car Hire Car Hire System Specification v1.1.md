# Movara Car Hire: Car Hire System Specification

## Confirmed client update — October 26, 2026

This update supersedes conflicting requirements and open questions below.

- Contracts will be signed manually until the client agrees to another signing method.
- Payments will use an M-Pesa Buy Goods till, with STK Push and manual payment options. If STK fails, the customer can pay manually and enter the M-Pesa code. Receipt must be verified before confirming payment; a customer code alone is insufficient. The till number and merchant credentials are still pending. The implemented manual flow requires finance verification; STK integration is pending.
- Every vehicle requires guarantor details and next-of-kin contacts/details.
- The KYC review target is 30 minutes before vehicle handover. No staffed opening/closing hours have been supplied.
- Minimum driver age is 22 years; minimum time holding a licence is two years. Additional drivers and chauffeur hire are available where applicable, with arrangements confirmed by staff. Cross-border travel is excluded for now.
- Use flat daily or agreed market rates confirmed before payment. Weekend, seasonal and long-term pricing rules are not introduced.
- Contact email: movaracarhire@gmail.com. The existing phone number remains unchanged.
- Remaining policy decisions will be added when the client supplies details; no deposit, privacy, retention, refund or insurance terms are inferred from this update.


Version 1.1 | Draft for review | October 22, 2026

Prepared by: Pauline Moraa

This version updates the original technical specification (v1.0, written under the working name MoBri). It reflects the business name registered as Movara Car Hire and the decisions made since: identity checks and contract signing happen in person, payment is the last step, and images captured at handover are checked against the data already in the system.

## 1. Purpose and scope

The system lets Movara Car Hire take a booking online, check the customer's documents quickly, collect payment by M-Pesa or bank, and then complete the identity check, contract and vehicle release in person at handover. It also covers returns, inspection, damage records and an auditable history of every rental.

In scope: customer registration, document submission, KYC review, booking and availability, payment, physical handover, contract record keeping, return and inspection, staff tools, notifications, audit and reporting.

Out of scope for this version: online biometrics or selfie matching, electronic signing, public marketplace for third-party car owners, and fully automated government database checks (listed as a later option).

## 2. Key decisions

- No online biometrics. Face and identity confirmation happens in person at handover by trained staff.
- The contract is signed in person on paper (or on a staff tablet if you choose later). The signed copy is scanned or photographed and attached to the booking. The vehicle cannot be released until it is.
- Customers upload photos of their ID and driving licence online. Staff then check the original documents and the customer's face in person, capture fresh images, and compare them with what the customer submitted online.
- Online KYC review is completed within 30 minutes during staffed hours.
- Payment is the last online step, after KYC approval. STK Push gives an instant result. A manual M-Pesa code entered by the customer is checked instantly against payments already received.
- Online approval is conditional. Final approval to release a vehicle only happens at the handover desk.

## 3. End-to-end customer journey

1. The customer chooses a vehicle and dates and sees real availability.
2. The customer registers with a phone number verified by one-time code, and fills in personal details.
3. The customer uploads photos of their national ID (or passport) and driving licence, front and back, and gives next-of-kin details.
4. The system runs automatic checks and places the case in the staff review queue with a 30-minute timer.
5. A reviewer checks the documents and the licence and approves, rejects, or asks for corrections. The customer is told by SMS or WhatsApp.
6. After approval the customer is shown the amount due and pays, as the final online step. They pay by STK Push, or manually by Paybill, Till or bank and enter the M-Pesa code or bank reference.
7. Once payment is confirmed the booking is Confirmed and a pickup time is fixed.
8. At pickup, staff verify the customer in person, capture images, check them against the online submission, have the contract signed, inspect the vehicle with the customer, and release it.
9. At return, staff inspect the vehicle, record the condition and mileage, settle any charges, and close the rental.

## 4. Roles and permissions

- **Customer:** registers, uploads documents, books, pays, sees their own bookings and contract copy.
- **KYC reviewer:** sees the review queue, documents and checks, and approves, rejects or requests more information. Cannot confirm payments or release vehicles.
- **Handover and front-desk staff:** run physical verification, capture images, record the signed contract, inspect and release vehicles, and receive returns.
- **Finance:** confirms manual payments that did not match automatically, processes refunds, and sees reconciliation reports.
- **Fleet manager:** manages vehicles, documents, service and inspection schedules, and tracker status.
- **Admin or owner:** manages users and roles, pricing, policies and settings, and can override with a recorded reason. Every override is logged.

Staff accounts use two-factor authentication. No role can edit or delete audit records.

## 5. Online KYC: document submission and review

### 5.1 Information collected

- Full name as on the ID, national ID or passport number, date of birth
- Phone number (verified by one-time code) and email
- Driving licence number, class and expiry
- Residential address
- Next-of-kin or emergency contact
- Guarantor details where required for higher-value vehicles
- Intended use: destination, and whether the vehicle will leave the country

### 5.2 Images uploaded online

- National ID or passport: front and back
- Driving licence: front and back

No selfie or live face capture is taken online. Uploaded images are stored privately and are never publicly accessible.

### 5.3 Automatic checks

- ID and licence number format validation
- Licence not expired and valid for the whole rental period
- Customer meets the minimum age and minimum licence age for the vehicle category
- Duplicate detection: the same ID or licence number used on another account
- Internal blocklist check for customers previously refused or flagged
- Phone number verified
- Image quality check, so blurred or cropped images are sent back immediately instead of waiting for a reviewer

### 5.4 Manual review

A reviewer compares the uploaded images with the typed details, checks that the documents look genuine, and confirms the licence through the NTSA check. The reviewer then chooses one of:

- **Approve:** the customer proceeds to payment.
- **Request correction:** the customer is told exactly what to fix (for example, licence photo is cropped) and the case returns to the queue with its time preserved.
- **Reject:** a reason is recorded and the customer is told they cannot proceed.

Approval at this stage is conditional on the physical checks at handover.

### 5.5 The 30-minute target

- The timer starts when a complete submission arrives.
- Staff are alerted at 15 minutes and an admin is alerted at 25 minutes.
- The system records the due time and whether it was missed, so performance can be reported.
- Customers see a status message such as Reviewing your documents, usually within 30 minutes.
- The target applies during stated staffed hours. Submissions made outside those hours are reviewed when staff come on duty, and the customer is told so when they submit. Staffed hours must be defined before launch.

### 5.6 Approval validity

Each approval is tied to the booking it was given for and expires if payment is not made within the hold period. A returning customer keeps their approved documents on file, but a reviewer rechecks them when the licence or ID expires, or when details change.

## 6. Booking, availability and holds

- Availability is calculated from existing bookings and blocking statuses, not from a manual booked flag.
- Two bookings for the same vehicle must never overlap. This is enforced by the database itself (an exclusion constraint on vehicle and time range for blocking statuses), so two customers acting at the same moment cannot both succeed.
- A vehicle is held for the customer from the moment their KYC is approved until the payment hold expires.
- Hold lengths depend on the payment method, and are configurable: about 30 minutes for STK Push, 60 to 120 minutes for manual Paybill or Till, and longer for bank transfer with staff able to extend.
- If payment arrives after a hold has expired and the vehicle is no longer free, finance is alerted, and the customer is offered another vehicle or a refund.
- Staff can create bookings on behalf of customers who contact Movara by phone, WhatsApp or in person. These follow the same KYC and payment steps.

## 7. Payments (the last online step)

### 7.1 STK Push

The customer chooses M-Pesa, the system sends an STK prompt to their phone, and the customer enters their PIN. Safaricom's callback confirms the result, and the booking updates immediately. If a callback is missed, a status query checks the outcome automatically.

### 7.2 Manual M-Pesa (Paybill or Till)

The customer pays from the M-Pesa menu using the booking number as the account reference, then enters the M-Pesa code in the system.

The system receives a notification for every payment made to the Paybill or Till (through Safaricom's C2B confirmation), and stores the code, amount, phone number and time. When the customer enters their code, the system looks it up locally, so the result is instant. A code is accepted only if it:

- exists in the received payments;
- matches the amount due (underpayment, overpayment and partial payments are flagged for finance);
- has not been used for another booking; and
- falls within the booking's payment window.

If it passes, the booking moves to Confirmed immediately. If a customer enters a code before the notification has arrived, the system holds the entry as pending and confirms automatically as soon as the payment appears.

### 7.3 Bank transfer

The customer enters the bank reference. Unless the bank provides a notification feed, finance matches it against the statement and confirms it. This is the slow option, and customers should be steered toward M-Pesa where possible.

### 7.4 Payment rules

- Every M-Pesa code can be used once, enforced by a unique constraint in the database.
- Confirmations are idempotent: the same Safaricom callback arriving twice does not create two payments.
- Staff verify manual and bank payments against the actual statement and never against screenshots or forwarded messages.
- Every manual confirmation records who confirmed it and when.
- Payment statuses: initiated, pending verification, confirmed, failed, rejected, refunded.
- Cash and till payments taken at the office are recorded by staff and linked to the booking.
- A reconciliation job compares received payments with booking records each day and reports mismatches.
- Money is stored as integer amounts, never as floating point numbers.

### 7.5 Deposits and refunds

Whether a security deposit is taken online with the payment, or held differently at handover, is an open decision (see section 16). Whatever is chosen, the amount, method and refund conditions must appear in the contract and be recorded against the booking.

## 8. Physical handover

Handover is the final and most important control, because it is where a stranger becomes a driver of a valuable asset. The vehicle is released only when every gate below is passed.

### 8.1 Gates

1. **Booking check:** the booking is Confirmed and paid, and the pickup time is within the allowed window.
2. **Original documents:** the customer presents the original national ID (or passport) and the original driving licence.
3. **Face check:** the staff member compares the customer's face with the ID photo and the licence photo.
4. **Details check:** name, ID number, date of birth and licence number on the originals match the online submission. The licence is valid, not expired, and covers the vehicle class.
5. **Image capture:** staff capture images (section 9) in the system.
6. **Image comparison:** staff compare the new images with the online images side by side and record the result.
7. **Contract signing:** the contract is printed from the system and signed by the customer and a Movara representative. The signed copy is scanned or photographed and attached to the booking.
8. **Vehicle inspection:** staff and the customer walk around the vehicle together, record the condition, odometer reading and fuel level, and the customer confirms.
9. **Release:** the staff member marks the vehicle as released, the booking becomes Active, and the keys are handed over.

The system will not allow release until gates 2 to 8 are completed and recorded.

### 8.2 If something does not match

The staff member must not release the vehicle. They record the reason, and the case goes to a supervisor. A supervisor can override only with a written reason, and the override is logged. If handover fails for an identity or document reason, the booking is marked Handover Failed and the refund rules in section 16 apply.

### 8.3 No-shows

If the customer does not arrive within the agreed grace period, the booking is marked No-show and the vehicle is released back into availability. Fees follow the cancellation policy.

## 9. Image capture and verification

### 9.1 Images captured at handover

- A photo of the customer's face, taken at the desk
- The original national ID or passport, front and back
- The original driving licence, front and back
- The signed contract, scanned or photographed
- The vehicle: all four sides, interior, dashboard showing the odometer and fuel gauge, number plates, and close-ups of every existing scratch or dent
- The tracker status, where fitted

### 9.2 Comparison with system data

The handover screen shows, side by side:

- the ID and licence images the customer uploaded online;
- the images just captured from the originals; and
- the live face photo.

The staff member ticks each check: face matches ID photo, face matches licence photo, name matches, ID number matches, licence number matches, licence valid and correct class, and document looks genuine and unaltered. Any unticked item blocks release and is recorded with a reason.

This is a human comparison supported by the system. Automatic face matching is not part of this version. It could be added later as a staff aid, without changing the process.

### 9.3 Image rules

- Every image records the time, the staff member, the booking and the device.
- Images cannot be edited or overwritten. A new capture creates a new record.
- Images are stored privately and shown only through short-lived secure links to authorised staff.
- The same set of vehicle images is captured again at return so condition can be compared directly.
- Images are compressed before upload so slow connections do not delay handover, and capture is allowed to retry if the connection drops.

## 10. Contract

- The system generates the contract from the booking, with the customer's details, the vehicle, the dates and times, the rates, the deposit, the mileage and fuel rules, the excess and liability terms, and the cancellation and late-return terms.
- Each contract has a unique number and records which version of the terms was used.
- It is printed and signed in person by the customer and a Movara representative. A witness signature can be added for high-value vehicles.
- The signed copy is scanned or photographed, attached to the booking and cannot be changed afterwards.
- The customer receives a copy, on paper at the desk and as a PDF by WhatsApp or email.
- The contract text should be reviewed by a lawyer before launch, including liability, excess, mileage, cross-border travel and handling of traffic fines.

## 11. Returns and inspection

1. Staff open the active booking and record the return time.
2. The vehicle is photographed with the same angles as at handover, with odometer and fuel level.
3. Staff compare the return images with the handover images and note any new damage.
4. Late-return, mileage, fuel and damage charges are calculated from the contract and shown to the customer.
5. The deposit is refunded or applied, and any balance is collected.
6. The booking is closed. If damage is found, a damage record is opened with the images, estimates and customer communication.

Overdue vehicles trigger an escalation: reminder by SMS, call, contact the next-of-kin or guarantor, and, if unreachable, a report to the police with the full record of the rental.

## 12. Vehicle management and tracking

- Each vehicle has a record with registration, make, model, category, daily rate, mileage and status.
- Insurance, inspection and service dates are tracked, and a vehicle is blocked from booking when a required document has expired.
- Every vehicle should have a GPS tracker with tamper and power-disconnect alerts. Reports describe thieves disabling trackers, so alerts for a disconnected device matter as much as location.
- Vehicles under service or repair are blocked from availability for the period.

## 13. Booking statuses

Draft, KYC submitted, KYC in review, KYC needs correction, KYC rejected, KYC approved, awaiting payment, payment pending verification, confirmed, handover in progress, handover failed, active (on hire), returned (inspection pending), closed, cancelled, expired, and no-show.

Every change of status records who or what caused it, and when. A booking cannot skip a status.

## 14. Data model overview

Core records: users and roles; customers; customer documents (with image references); KYC cases (with timers and decisions); vehicles and vehicle documents; pricing rules; bookings and booking status history; payments and received M-Pesa transactions; handover records and handover checks; images; contracts; inspection records; damage records; return records; notifications; and audit logs.

Important rules:

- A booking is linked to one customer, one vehicle and one approved KYC case.
- Images are linked to a booking and a stage (online submission, handover, return).
- Payments, images, contracts and audit logs are append-only.
- Times are stored in UTC and shown in Africa/Nairobi.

## 15. Security, data protection and audit

- ID numbers, licence numbers and personal contact details are encrypted at rest, and all traffic uses HTTPS.
- Images are never public. Access is by short-lived secure links and is logged.
- Login and one-time-code attempts are rate limited, and staff accounts require two-factor authentication.
- Every action on a customer, booking, payment or image is written to an audit log that no one can edit.
- Movara collects IDs, licences and facial photos, which are personal data and in part biometric data under the Kenya Data Protection Act. Before launch, Movara should:
  - register with the Office of the Data Protection Commissioner;
  - show a privacy notice and record the customer's consent at KYC submission;
  - set a retention period for documents and images, including how long they are kept after the last rental;
  - provide a process to handle access, correction and deletion requests; and
  - limit staff access to what each role needs.
- A lawyer should confirm these obligations for the exact way Movara stores and uses the data.

## 16. Open decisions

These need an answer before the build can be finalised.

- **Deposit:** amount per vehicle category, whether it is paid online or at handover, and how it is refunded.
- **Handover failure refund:** if a customer fails the physical check (for example, an ID mismatch), what is refunded and what is kept for costs. A full refund minus transaction charges is a common starting point.
- **No-show window:** how long the vehicle is held after the pickup time.
- **Cancellation policy:** deadlines and fees.
- **Insurance:** what is covered, the excess, and liability for damage and theft.
- **Guarantor:** which vehicle categories require one.
- **Staffed hours:** the hours in which the 30-minute KYC target applies.
- **Driver rules:** minimum age, minimum licence age, additional drivers, chauffeur hire and cross-border travel.
- **Pricing:** flat daily rate or rules for weekend, season and long-term discounts.
- **Tracker supplier:** model, subscription and tamper alerts.

## 17. Delivery phases

**Phase 1: working core.** Vehicle records and availability, customer registration with phone verification, document upload, KYC review queue with timers, booking with holds and database-level overlap protection, payments (STK Push, manual M-Pesa code with instant lookup, bank manual), handover module with image capture, comparison, contract record and release gates, return and inspection, staff roles, audit log, SMS and WhatsApp notifications.

**Phase 2: control and growth.** GPS tracker integration and tamper alerts, pricing rules and discounts, damage claims, overdue escalation workflow, reconciliation reports, reporting dashboards.

**Phase 3: scale.** Optional government database checks through a provider as a staff aid, optional automatic face matching as a staff aid, corporate accounts, loyalty, and owner payouts if third-party vehicles are added.

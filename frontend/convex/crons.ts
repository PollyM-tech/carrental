import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
const crons = cronJobs();
crons.daily("clean expired enquiry rate limits", { hourUTC: 2, minuteUTC: 0 }, internal.enquiries.cleanupLimits, {});
export default crons;

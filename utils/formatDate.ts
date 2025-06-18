import { Timestamp } from "firebase/firestore";

// Checks if a value looks like a Firestore timestamp object
function isPlainTimestamp(
  obj: any
): obj is { seconds: number; nanoseconds: number } {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.seconds === "number" &&
    typeof obj.nanoseconds === "number"
  );
}

// Recursively revives Firestore-like timestamps
export function reviveTimestamps(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(reviveTimestamps);
  }

  if (isPlainTimestamp(obj)) {
    return new Timestamp(obj.seconds, obj.nanoseconds);
  }

  if (obj && typeof obj === "object") {
    const revived: any = {};
    for (const key in obj) {
      revived[key] = reviveTimestamps(obj[key]);
    }
    return revived;
  }

  return obj;
}

import { validate as validateUuid, version as uuidVersion, v7 as uuidv7 } from "uuid";
import type { Device, DeviceId, Session, SessionId, User, UserId } from "../entities/types";
import type { IdGenerator } from "./local-first";

export const CURRENT_USER_ID: UserId = "019990f2-9970-74b1-88fb-43bd0e609568";
export const CURRENT_DEVICE_ID: DeviceId = "019990f2-9970-7a8b-8a4b-fd9ed2c43f91";
export const CURRENT_SESSION_ID: SessionId = "019990f2-9970-7d5e-bd1a-4cb24060c7f2";

export class UuidV7Generator implements IdGenerator {
  next() {
    return uuidv7();
  }
}

export function createUuidV7() {
  return uuidv7();
}

export function isCanonicalUuid(value: string) {
  return value === value.toLowerCase() && validateUuid(value);
}

export function isUuidV7(value: string) {
  return isCanonicalUuid(value) && uuidVersion(value) === 7;
}

export const localUser: User = {
  id: CURRENT_USER_ID,
  name: "Youna",
  initials: "Y",
  color: "#216bff",
  presence: "online",
  createdAt: "2026-09-27T00:00:00.000Z",
};

export const localDevice: Device = {
  id: CURRENT_DEVICE_ID,
  userId: CURRENT_USER_ID,
  label: "Local development device",
  status: "active",
  enrolledAt: "2026-09-27T00:00:00.000Z",
  notificationRegistrationState: "unknown",
};

export const localSession: Session = {
  id: CURRENT_SESSION_ID,
  userId: CURRENT_USER_ID,
  deviceId: CURRENT_DEVICE_ID,
  status: "active",
  issuedAt: "2026-09-27T00:00:00.000Z",
};

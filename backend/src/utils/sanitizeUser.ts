import { User } from "@prisma/client";

export function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

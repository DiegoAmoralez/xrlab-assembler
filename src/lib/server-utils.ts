import { getSession } from "./auth";

export const requireApiAuth = async () => {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return { authorized: false as const, session: null };
  }
  return { authorized: true as const, session };
};

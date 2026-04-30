"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const Token = async () => {
  const session = await getServerSession(authOptions);

  const UserToken = {
    Credential: session?.keycloakToken ?? null,
  };

  return UserToken;
};
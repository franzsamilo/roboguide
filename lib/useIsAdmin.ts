"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useIsAdmin() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      setIsAdmin(false);
      return;
    }

    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [session, status]);

  return isAdmin;
}

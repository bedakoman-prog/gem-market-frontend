"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";

// Nombre de conversations avec un message non lu — alimente le badge sur
// l'onglet "Messages" de la nav (section 5 : notifications de messagerie).
// Interrogé régulièrement plutôt qu'en push pur : plus simple, et couvre
// aussi les navigateurs/appareils où l'utilisateur n'a pas autorisé les
// notifications (voir lib/push.ts).
const POLL_INTERVAL_MS = 20_000;

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    let cancelled = false;

    function poll() {
      api
        .get<{ count: number }>("/conversations/unread-count")
        .then((res) => {
          if (!cancelled) setCount(res.count);
        })
        .catch(() => {});
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return count;
}

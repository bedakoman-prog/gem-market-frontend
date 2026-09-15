"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flag, Send, ShieldAlert } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Conversation, Message } from "@/lib/types";
import { priceOfCard } from "@/lib/format";
import { categoryIcon, categoryTint } from "@/lib/categoryMeta";
import { TopBar } from "@/components/TopBar";
import { LoadingState, ErrorState } from "@/components/LoadingState";

interface MessagesResponse {
  conversation: Conversation;
  messages: Message[];
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ready } = useRequireAuth();
  const { me } = useAuth();

  const { data, loading, error, reload } = useApiData(
    () => (ready ? api.get<MessagesResponse>(`/conversations/${id}/messages`) : Promise.resolve(null)),
    [ready, id],
  );

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      api
        .get<MessagesResponse>(`/conversations/${id}/messages`)
        .then(() => reload())
        .catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, [ready, id, reload]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [data?.messages?.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setSending(true);
    try {
      await api.post(`/conversations/${id}/messages`, { body });
      reload();
    } catch (err) {
      setDraft(body);
      alert(err instanceof ApiError ? err.message : "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <LoadingState label="Vérification de la connexion…" />;
  if (loading && !data) return <LoadingState />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const conv = data.conversation;
  const iAmSeller = me?.id === conv.sellerId;
  const other = iAmSeller ? conv.buyer : conv.seller;
  const listing = conv.listing;
  const Icon = listing ? categoryIcon(listing.categoryId) : null;
  const tint = listing ? categoryTint(listing.categoryId) : null;

  return (
    <div className="fade flex h-[calc(100vh-140px)] flex-col">
      <TopBar
        title={other?.name || "Conversation"}
        right={
          <Link
            href={`/report?sellerId=${conv.sellerId}&listingId=${conv.listingId}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--clay)" }}
          >
            <Flag size={16} />
          </Link>
        }
      />

      {listing && (
        <Link
          href={`/listings/${listing.id}`}
          className="mb-3 flex items-center gap-2.5 rounded-[var(--radius-m)] border p-2.5"
          style={{ borderColor: "var(--line)" }}
        >
          <span
            className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-s)]"
            style={{ background: tint?.bg, color: tint?.fg }}
          >
            {Icon && <Icon size={17} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-bold" style={{ color: "var(--ink)" }}>{listing.title}</div>
            <div className="font-[var(--font-mono)] text-[11.5px]" style={{ color: "var(--teal-700)" }}>
              {priceOfCard(listing)}
            </div>
          </div>
        </Link>
      )}

      <div ref={scrollRef} className="hide-scrollbar mb-3 flex-1 space-y-2.5 overflow-y-auto px-0.5">
        <div className="flex justify-center">
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-semibold"
            style={{ background: "var(--surface-2)", color: "var(--text-faint)" }}
          >
            <ShieldAlert size={11} />
            Conversation sécurisée via GEM Market. Ne payez jamais en dehors de l&apos;appli.
          </span>
        </div>
        {data.messages.map((m) => {
          const mine = m.authorId === me?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div
                  className="px-3.5 py-2.5 text-[13px]"
                  style={
                    mine
                      ? { background: "var(--teal-700)", color: "#fff", borderRadius: "15px 15px 4px 15px" }
                      : {
                          background: "var(--surface)",
                          color: "var(--text)",
                          border: "1px solid var(--line)",
                          borderRadius: "15px 15px 15px 4px",
                        }
                  }
                >
                  {m.body}
                </div>
                <div
                  className={`mt-0.5 text-[10px] ${mine ? "text-right" : "text-left"}`}
                  style={{ color: "var(--text-faint)" }}
                >
                  {new Date(m.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrivez un message…"
          className="flex-1 rounded-full border px-4 py-2.5 text-[13.5px] outline-none"
          style={{ borderColor: "var(--line)" }}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full disabled:opacity-50"
          style={{ background: "var(--teal-700)", color: "#fff" }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

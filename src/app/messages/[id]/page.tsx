"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Flag, Languages, Pencil, Send, ShieldAlert, Trash2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApiData } from "@/lib/useApi";
import { useAuth } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/lib/toast";
import type { Conversation, Message } from "@/lib/types";
import { priceOfCard, sellerDisplayName } from "@/lib/format";
import { categoryIcon, categoryTint } from "@/lib/categoryMeta";
import { TopBar } from "@/components/TopBar";
import { LoadingState, ErrorState } from "@/components/LoadingState";

interface MessagesResponse {
  conversation: Conversation;
  messages: Message[];
}

// Langues proposées pour la traduction d'un message reçu (section 5 :
// "traduire un message reçu à la langue de son choix" — le choix se fait
// message par message, pas pour toute la conversation). "zh-CN" est le code
// attendu côté serveur pour le chinois simplifié.
const LANGUAGES: { code: string; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "zh-CN", label: "中文" },
  { code: "pt", label: "Português" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "ru", label: "Русский" },
];

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ready } = useRequireAuth();
  const { me } = useAuth();
  const { toast } = useToast();

  const { data, loading, error, reload } = useApiData(
    () => (ready ? api.get<MessagesResponse>(`/conversations/${id}/messages`) : Promise.resolve(null)),
    [ready, id],
  );

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Édition d'un message existant (auteur uniquement — voir bouton crayon).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingEditId, setSavingEditId] = useState<string | null>(null);

  // Suppression "douce" d'un message (auteur uniquement — voir bouton corbeille).
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Traduction par message reçu : chaque message affiche son propre menu de
  // langues (bouton "Languages"), avec un cache pour ne jamais retraduire
  // deux fois le même texte dans la même langue.
  const [openTranslateId, setOpenTranslateId] = useState<string | null>(null);
  const [msgLang, setMsgLang] = useState<Record<string, string>>({});
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);

  useEffect(() => {
    setOpenTranslateId(null);
    setMsgLang({});
    setTranslationCache({});
  }, [id]);

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

  useEffect(() => {
    // On marque le fil comme lu à chaque fois qu'on ouvre la conversation, et
    // à nouveau chaque fois que le sondage (voir plus haut) rapporte de
    // nouveaux messages pendant qu'elle reste ouverte — évite qu'un badge
    // "non lu" persiste alors que l'utilisateur est en train de lire.
    if (!ready || !data?.messages?.length) return;
    api.post(`/conversations/${id}/read`, {}).catch(() => {});
  }, [ready, id, data?.messages?.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setSending(true);
    try {
      const sent = await api.post<Message>(`/conversations/${id}/messages`, { body });
      if (sent.flagged) {
        toast("Coordonnées masquées : restez sur la messagerie TROUVE TOUT, cela vous protège en cas de litige.");
      }
      reload();
    } catch (err) {
      setDraft(body);
      alert(err instanceof ApiError ? err.message : "Impossible d'envoyer le message.");
    } finally {
      setSending(false);
    }
  }

  function startEdit(m: Message) {
    setOpenTranslateId(null);
    setEditingId(m.id);
    setEditDraft(m.body ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  async function saveEdit(messageId: string) {
    const body = editDraft.trim();
    if (!body) return;
    setSavingEditId(messageId);
    try {
      await api.patch(`/conversations/${id}/messages/${messageId}`, { body });
      setEditingId(null);
      setEditDraft("");
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Impossible de modifier le message.");
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleDelete(messageId: string) {
    if (!window.confirm("Supprimer ce message ? Cette action est définitive.")) return;
    setDeletingId(messageId);
    try {
      await api.del(`/conversations/${id}/messages/${messageId}`);
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Impossible de supprimer le message.");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleTranslateMenu(messageId: string) {
    setEditingId(null);
    setOpenTranslateId((cur) => (cur === messageId ? null : messageId));
  }

  async function selectMsgLang(m: Message, code: string) {
    setOpenTranslateId(null);
    if (!code) {
      setMsgLang((prev) => {
        const next = { ...prev };
        delete next[m.id];
        return next;
      });
      return;
    }
    setMsgLang((prev) => ({ ...prev, [m.id]: code }));
    const key = `${m.id}:${code}`;
    if (translationCache[key] !== undefined) return;
    setTranslatingKey(key);
    try {
      const res = await api.post<{ translated: string }>("/translate", { text: m.body ?? "", target: code });
      setTranslationCache((prev) => ({ ...prev, [key]: res.translated }));
    } catch {
      toast("Traduction indisponible pour le moment.");
      setMsgLang((prev) => {
        const next = { ...prev };
        delete next[m.id];
        return next;
      });
    } finally {
      setTranslatingKey(null);
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
        title={sellerDisplayName(other) || "Conversation"}
        right={
          <Link
            href={`/report?sellerId=${conv.sellerId}&listingId=${conv.listingId}`}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full border"
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
            <div className="font-[var(--font-mono)] text-[12.5px]" style={{ color: "var(--teal-700)" }}>
              {priceOfCard(listing)}
            </div>
          </div>
        </Link>
      )}

      <div ref={scrollRef} className="hide-scrollbar mb-3 flex-1 space-y-2.5 overflow-y-auto px-0.5">
        <div className="flex justify-center">
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-center text-[11.5px] font-semibold"
            style={{ background: "var(--surface-2)", color: "var(--text-faint)" }}
          >
            <ShieldAlert size={11} />
            Restez sur TROUVE TOUT : ne partagez pas vos coordonnées et ne payez jamais en dehors de l&apos;appli.
          </span>
        </div>
        {data.messages.map((m) => {
          const mine = m.authorId === me?.id;
          const deleted = !!m.deletedAt;
          const activeLang = msgLang[m.id];
          const translationKey = activeLang ? `${m.id}:${activeLang}` : null;
          const isTranslating = translationKey !== null && translatingKey === translationKey;
          const translated = translationKey ? translationCache[translationKey] : undefined;
          const shown = activeLang ? translated ?? m.body : m.body;
          const isEditing = editingId === m.id;

          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                {isEditing ? (
                  <div
                    className="px-3 py-2"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: "15px 15px 4px 15px",
                    }}
                  >
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={2}
                      autoFocus
                      className="w-full resize-none bg-transparent text-[13px] outline-none"
                      style={{ color: "var(--text)" }}
                    />
                    <div className="mt-1.5 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        aria-label="Annuler"
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{ color: "var(--text-faint)" }}
                      >
                        <X size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(m.id)}
                        disabled={savingEditId === m.id || !editDraft.trim()}
                        aria-label="Enregistrer"
                        className="flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-50"
                        style={{ background: "var(--teal-700)", color: "#fff" }}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="px-3.5 py-2.5 text-[13px]"
                    style={
                      deleted
                        ? {
                            background: "var(--surface-2)",
                            color: "var(--text-faint)",
                            fontStyle: "italic",
                            borderRadius: mine ? "15px 15px 4px 15px" : "15px 15px 15px 4px",
                          }
                        : mine
                          ? { background: "var(--teal-700)", color: "#fff", borderRadius: "15px 15px 4px 15px" }
                          : {
                              background: "var(--surface)",
                              color: "var(--text)",
                              border: "1px solid var(--line)",
                              borderRadius: "15px 15px 15px 4px",
                            }
                    }
                  >
                    {deleted ? "Message supprimé" : isTranslating ? "Traduction…" : shown}
                  </div>
                )}

                <div
                  className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${mine ? "justify-end" : "justify-start"}`}
                  style={{ color: "var(--text-faint)" }}
                >
                  <span>
                    {new Date(m.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {m.flagged ? " · coordonnées masquées" : ""}
                    {!deleted && m.editedAt ? " · modifié" : ""}
                    {!deleted && activeLang && translated ? " · traduit" : ""}
                  </span>
                  {!deleted && !isEditing && mine && (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        aria-label="Modifier le message"
                        className="p-0.5"
                        style={{ color: "var(--text-faint)" }}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        aria-label="Supprimer le message"
                        className="p-0.5 disabled:opacity-50"
                        style={{ color: "var(--text-faint)" }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </>
                  )}
                  {!deleted && !mine && (
                    <button
                      type="button"
                      onClick={() => toggleTranslateMenu(m.id)}
                      aria-label="Traduire ce message"
                      className="p-0.5"
                      style={{ color: activeLang ? "var(--teal-700)" : "var(--text-faint)" }}
                    >
                      <Languages size={11} />
                    </button>
                  )}
                </div>

                {!deleted && !mine && openTranslateId === m.id && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => selectMsgLang(m, "")}
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        background: !activeLang ? "var(--teal-700)" : "var(--surface-2)",
                        color: !activeLang ? "#fff" : "var(--text-faint)",
                      }}
                    >
                      Original
                    </button>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => selectMsgLang(m, l.code)}
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          background: activeLang === l.code ? "var(--teal-700)" : "var(--surface-2)",
                          color: activeLang === l.code ? "#fff" : "var(--text-faint)",
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
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

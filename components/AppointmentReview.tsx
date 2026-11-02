"use client";
import { useEffect, useState } from "react";
type Appointment = {
  id: number;
  service_name: string;
  appointment_date: string;
  review_rating: number | null;
  review_comment: string | null;
};
export default function AppointmentReview({
  appointment: a,
  onSaved,
}: {
  appointment: Appointment;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [rating, setRating] = useState(0),
    [comment, setComment] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState<{
      rating: number;
      comment: string | null;
    } | null>(null);
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("avaliar") ===
      String(a.id)
    ) {
      setOpen(true);
      document
        .getElementById("avaliacao-" + a.id)
        ?.scrollIntoView({ block: "center" });
    }
  }, [a.id]);
  const review =
    saved ||
    (a.review_rating
      ? { rating: a.review_rating, comment: a.review_comment }
      : null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/cliente/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: a.id, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSaved(data.review);
      setOpen(false);
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article
      id={"avaliacao-" + a.id}
      className="rounded-2xl border bg-white p-5 space-y-3"
    >
      <h3 className="font-semibold">
        {a.service_name} ·{" "}
        {String(a.appointment_date).slice(0, 10).split("-").reverse().join("/")}
      </h3>
      {review ? (
        <div role="status">
          <p className="text-sm text-emerald-700">
            Obrigado! Sua avaliação: {review.rating} de 5 estrelas.
          </p>
          {review.comment && (
            <p className="text-sm text-gray-600 mt-2 break-words">
              {review.comment}
            </p>
          )}
        </div>
      ) : (
        <>
          <button
            type="button"
            className="admin-primary"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "Fechar" : "Avaliar serviço"}
          </button>
          {open && (
            <form onSubmit={submit} className="space-y-4">
              <fieldset>
                <legend className="text-sm font-medium mb-2">
                  Como foi seu atendimento?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label
                      key={n}
                      className={`cursor-pointer rounded-xl border px-3 py-2 ${rating === n ? "bg-blue-900 text-white" : "text-gray-700"}`}
                    >
                      <input
                        type="radio"
                        name={"rating-" + a.id}
                        value={n}
                        required
                        checked={rating === n}
                        onChange={() => setRating(n)}
                        className="mr-1"
                      />
                      {n} ★
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="admin-label">
                Comentário (opcional)
                <textarea
                  maxLength={1000}
                  rows={3}
                  className="admin-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>
              <button className="admin-primary" disabled={busy || !rating}>
                {busy ? "Enviando…" : "Enviar avaliação"}
              </button>
            </form>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </article>
  );
}

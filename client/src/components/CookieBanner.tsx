import { useState } from "react";

type CookieBannerProps = {
  onOpenPolicy?: () => void;
};

export default function CookieBanner({
  onOpenPolicy,
}: CookieBannerProps) {
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem("purekinky-cookie-consent") !== "accepted";
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const acceptCookies = () => {
    try {
      localStorage.setItem("purekinky-cookie-consent", "accepted");
    } catch {}

    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-black/95 p-5 text-white shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="mb-1 text-sm font-semibold">
            Utilizamos cookies
          </h3>

          <p className="text-xs leading-relaxed text-white/60">
            Utilizamos cookies necesarias para el funcionamiento de PureKinky
            y para mejorar tu experiencia.
          </p>

          {onOpenPolicy && (
            <button
              type="button"
              onClick={onOpenPolicy}
              className="mt-2 text-xs underline underline-offset-2"
            >
              Política de cookies
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={acceptCookies}
          className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:opacity-80"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
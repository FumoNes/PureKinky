import React from "react";

export type InfoPage =
  | "contact"
  | "faq"
  | "shipping"
  | "returns"
  | "terms"
  | "privacy"
  | "cookies";

interface InfoPanelProps {
  page?: InfoPage | null;
  onClose?: () => void;
}

const pageContent: Record<
  InfoPage,
  { title: string; content: string }
> = {
  contact: {
    title: "CONTACTO",
    content: "Ponte en contacto con PureKinky para cualquier consulta.",
  },
  faq: {
    title: "FAQ",
    content: "Aquí encontrarás las preguntas frecuentes de PureKinky.",
  },
  shipping: {
    title: "ENVÍOS",
    content: "Consulta las condiciones y tiempos de envío.",
  },
  returns: {
    title: "DEVOLUCIONES",
    content: "Consulta las condiciones de devolución.",
  },
  terms: {
    title: "TÉRMINOS",
    content: "Consulta los términos y condiciones de PureKinky.",
  },
  privacy: {
    title: "PRIVACIDAD",
    content: "Consulta nuestra política de privacidad.",
  },
  cookies: {
    title: "COOKIES",
    content: "Consulta nuestra política de cookies.",
  },
};

export default function InfoPanel({
  page,
  onClose,
}: InfoPanelProps) {
  if (!page) return null;

  const info = pageContent[page];
if (!info) return null;
  return (
    <div className="info-panel-overlay" onClick={onClose}>
      <aside
        className="info-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="info-panel-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="info-panel-content">
          <h2>{info.title}</h2>
          <p>{info.content}</p>
        </div>
      </aside>
    </div>
  );
}
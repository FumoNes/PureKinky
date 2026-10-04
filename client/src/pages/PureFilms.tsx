import "./purefilms.css";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function PureFilms() {
  const siteSettings = trpc.site.settings.useQuery();
  console.log("PUREFILMS SETTINGS:", siteSettings.data);

  const maintenanceEnabled =
    siteSettings.data?.maintenanceEnabled === true;

  const maintenanceMode =
    siteSettings.data?.maintenanceMode === "purefilms"
      ? "purefilms"
      : "all";

  const maintenanceEndsAt = siteSettings.data?.maintenanceEndsAt
    ? new Date(siteSettings.data.maintenanceEndsAt)
    : null;

  const [maintenanceTimeLeft, setMaintenanceTimeLeft] = useState(0);

  useEffect(() => {
    if (!maintenanceEnabled || !maintenanceEndsAt) {
      setMaintenanceTimeLeft(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        maintenanceEndsAt.getTime() - Date.now(),
      );

      setMaintenanceTimeLeft(remaining);
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [maintenanceEnabled, maintenanceEndsAt?.getTime()]);

  const maintenanceActive =
    maintenanceEnabled &&
    (!maintenanceEndsAt || maintenanceTimeLeft > 0);

  if (maintenanceActive && maintenanceMode === "purefilms") {
    return (
      <main className="maintenance-screen">
        <div className="maintenance-screen__content">
          <p className="maintenance-screen__eyebrow">
            PUREKINKY / PUREFILMS
          </p>

          <h1 className="maintenance-screen__title">
            {siteSettings.data?.maintenanceTitle || "PRÓXIMO DROP"}
          </h1>

          <p className="maintenance-screen__message">
            {siteSettings.data?.maintenanceMessage ||
              "Estamos preparando algo nuevo."}
          </p>

          {maintenanceEndsAt && (
            <div className="maintenance-screen__countdown">
              {Math.floor(maintenanceTimeLeft / 3600000)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor((maintenanceTimeLeft % 3600000) / 60000)
                .toString()
                .padStart(2, "0")}
              :
              {Math.floor((maintenanceTimeLeft % 60000) / 1000)
                .toString()
                .padStart(2, "0")}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="purefilms-page">

      <header className="purefilms-header">
        <a href="/" className="purefilms-back">
          ← VOLVER
        </a>

        <h1 className="purefilms-title">
          PURE<span>FILMS</span>
        </h1>

        <p className="purefilms-subtitle">
          FILMMAKING · EDITING · VISUALS
        </p>
      </header>

      <section className="purefilms-works">

        <h2 className="purefilms-section-title">
          WORKS
        </h2>

        <div className="purefilms-grid">

          <article className="purefilm-card">
            <div className="purefilm-placeholder">
              VIDEO
            </div>

            <div className="purefilm-info">
              <h3>DROP 01</h3>
              <p>PURE KINKY</p>
            </div>
          </article>

          <article className="purefilm-card">
            <div className="purefilm-placeholder">
              VIDEO
            </div>

            <div className="purefilm-info">
              <h3>DROP 02</h3>
              <p>PURE KINKY</p>
            </div>
          </article>

        </div>

      </section>

      <section className="purefilms-contact">

        <h2>¿QUIERES TRABAJAR CON NOSOTROS?</h2>

        <p>
          Creamos contenido audiovisual para marcas,
          campañas, productos y proyectos.
        </p>

        <a
  href="https://wa.me/34722516474?text=Hola%2C%20estoy%20interesado%20en%20los%20servicios%20de%20PureFilms"
  target="_blank"
  rel="noopener noreferrer"
>
  CONTACTAR
</a>

      </section>

    </main>
  );
}
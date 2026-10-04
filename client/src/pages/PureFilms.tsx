import "./purefilms.css";

export default function PureFilms() {
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
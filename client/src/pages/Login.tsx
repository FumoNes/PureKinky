import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { trpc } from "@/lib/trpc";
import "./login.css";

export default function Login() {
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
  });

  const mutation =
    mode === "login" ? loginMutation : registerMutation;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (mode === "login") {
        await loginMutation.mutateAsync({
          email,
          password,
        });
      } else {
        await registerMutation.mutateAsync({
          name,
          email,
          password,
        });
      }
    } catch {
      // El error ya se muestra mediante mutation.error
    }
  };

  const switchMode = () => {
    setMode(current => current === "login" ? "register" : "login");
    loginMutation.reset();
    registerMutation.reset();
  };

  return (
    <main className="pk-login">
      <div className="pk-login__grain" />

      <div className="pk-login__orb pk-login__orb--one" />
      <div className="pk-login__orb pk-login__orb--two" />

      <header className="pk-login__top">
        <button
          type="button"
          className="pk-login__back"
          onClick={() => setLocation("/")}
        >
          <span>←</span>
          VOLVER
        </button>

        <div className="pk-login__counter">
          <span>001</span>
          <i />
          MEMBER ACCESS
        </div>
      </header>

      <section className="pk-login__layout">
        <div className="pk-login__identity">
          <p className="pk-login__eyebrow">
            PUREKINKY / PRIVATE AREA
          </p>

          <div className="pk-login__logo">
            <span>PURE</span>
            <strong>KINKY</strong>
          </div>

          <p className="pk-login__manifesto">
            NO VENIMOS
            <br />
            <em>A ENCAJAR.</em>
          </p>

          <div className="pk-login__meta">
            <span>EST. 2026</span>
            <span>DROP 01</span>
            <span>NOT FOR EVERYONE</span>
          </div>
        </div>

        <div className="pk-login__card">
          <div className="pk-login__card-top">
            <div>
              <span className="pk-login__status">
                <i />
                SECURE CONNECTION
              </span>

              <p className="pk-login__number">
                / {mode === "login" ? "01" : "02"}
              </p>
            </div>

            <LockKeyhole size={18} strokeWidth={1.5} />
          </div>

          <div className="pk-login__heading">
            <p>PUREKINKY MEMBER</p>

            <h1>
              {mode === "login" ? (
                <>
                  ENTRA<span>.</span>
                </>
              ) : (
                <>
                  ÚNETE<span>.</span>
                </>
              )}
            </h1>

            <div className="pk-login__line" />

            <p className="pk-login__description">
              {mode === "login"
                ? "Accede a tu espacio privado."
                : "Crea tu cuenta y entra en la comunidad."}
            </p>
          </div>

          <form
            className="pk-login__form"
            onSubmit={handleSubmit}
          >
            {mode === "register" && (
              <label className="pk-login__field">
                <span>
                  <UserRound size={14} />
                  NOMBRE
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="TU NOMBRE"
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </label>
            )}

            <label className="pk-login__field">
              <span>
                <Mail size={14} />
                EMAIL
              </span>

              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="TU@EMAIL.COM"
                required
                autoComplete="email"
              />
            </label>

            <label className="pk-login__field">
              <span>
                <LockKeyhole size={14} />
                CONTRASEÑA
              </span>

              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                minLength={mode === "register" ? 8 : 1}
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
              />
            </label>

            {mutation.error && (
              <div className="pk-login__error">
                <span>!</span>
                <p>{mutation.error.message}</p>
              </div>
            )}

            <button
              type="submit"
              className="pk-login__submit"
              disabled={mutation.isPending}
            >
              <span>
                {mutation.isPending
                  ? "VERIFICANDO..."
                  : mode === "login"
                    ? "ENTRAR"
                    : "CREAR CUENTA"}
              </span>

              {!mutation.isPending && (
                <ArrowRight size={19} strokeWidth={1.7} />
              )}
            </button>
          </form>

          <button
            type="button"
            className="pk-login__switch"
            onClick={switchMode}
          >
            <span>
              {mode === "login"
                ? "¿NO TIENES CUENTA?"
                : "¿YA TIENES CUENTA?"}
            </span>

            <strong>
              {mode === "login"
                ? "CREAR CUENTA"
                : "ENTRAR"}
            </strong>
          </button>

          <div className="pk-login__card-footer">
            <span>PUREKINKY</span>
            <span>AUTH / 2026</span>
          </div>
        </div>
      </section>

      <footer className="pk-login__footer">
        <span>VISTE COMO ERES.</span>
        <span>PUREKINKY®</span>
        <span>MADE IN MADRID</span>
      </footer>
    </main>
  );
}
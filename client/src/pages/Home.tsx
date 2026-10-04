import React, { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, Ban, Bell, BellOff, Check, ChevronDown, Instagram, LockKeyhole, Menu, Minus, Plus, Send, ShoppingBag, Terminal, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { catalogCategories, catalogProducts, formatPrice, type CatalogProduct } from "@shared/catalog";
import { addProductToOrder, createBizumWhatsAppUrl, setOrderQuantity, type OrderLine, type Personalization } from "@shared/order";
import { closePanels, openPanel, type ActivePanel } from "@shared/panels";
import { isValidEmail, normalizeEmail } from "@shared/email";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import InfoPanel, { type InfoPage } from "@/components/InfoPanel";
import CookieBanner from "@/components/CookieBanner";
import "./pureclub.css";

const BIZUM_NUMBER = "722516474";
const INSTAGRAM_URL = "https://www.instagram.com/purekinky_official/";
const WHATSAPP_NUMBER = "34722516474";
const INFO_PAGES: InfoPage[] = ["contact", "faq", "shipping", "returns", "terms", "privacy", "cookies"];
const getInitialInfoPage = (): InfoPage | null => {
  if (typeof window === "undefined") return null;
  const candidate = new URLSearchParams(window.location.search).get("info") as InfoPage | null;
  return candidate && INFO_PAGES.includes(candidate) ? candidate : null;
};
const reveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };


function ProductCard({ product, index, onConfigure }: { product: CatalogProduct; index: number; onConfigure: (product: CatalogProduct) => void }) {
  const unavailable = product.availability === "Lanzamiento próximo";
  return <motion.article className={`product-card product-card--${index + 1}`} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .15 }} transition={{ duration: .45, delay: Math.min(index * .06, .18), ease: [.23, 1, .32, 1] }}>
    <div className="product-card__visual">
      <img className="product-card__img product-card__img--main" src={product.image} alt={product.imageAlt} loading="lazy" />
      <img className="product-card__img product-card__img--hover" src={product.hoverImage} alt="" loading="lazy" />
      <span className="product-card__label">{product.label}</span>
      <button className="product-card__quick-add" aria-label={`Configurar ${product.name} en Drop 01`} disabled={unavailable} onClick={() => onConfigure(product)}><Plus size={18} /></button>
    </div>
    <div className="product-card__details"><div><p className="eyebrow">{product.category}</p><h3>{product.name}</h3></div><strong>{formatPrice(product.price)}</strong></div>
    <div className="product-card__footer"><span>{product.availability}</span>{!unavailable && <button onClick={() => onConfigure(product)}>Configurar en Drop 01 <ArrowRight size={15} /></button>}</div>
    {!unavailable && <p className="catalog-config-note">Configura talla, nombre y dorsal en Drop 01 antes de añadir.</p>}
  </motion.article>;
}

const formatMaintenanceTime = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
};

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [maintenanceEnabledInput, setMaintenanceEnabledInput] =
  useState(false);

const [maintenanceTitleInput, setMaintenanceTitleInput] =
  useState("PRÓXIMO DROP");

const [maintenanceMessageInput, setMaintenanceMessageInput] =
  useState("");

const [maintenanceEndsAtInput, setMaintenanceEndsAtInput] =
  useState("");

  const siteSettings = trpc.site.settings.useQuery();
  const maintenanceEnabled = siteSettings.data?.maintenanceEnabled === true;
  const maintenanceEndsAt = siteSettings.data?.maintenanceEndsAt
  ? new Date(siteSettings.data.maintenanceEndsAt)
  : null;

const [maintenanceTimeLeft, setMaintenanceTimeLeft] = useState(0);
  const [infoPage, setInfoPage] = useState<InfoPage | null>(getInitialInfoPage);
  const [cart, setCart] = useState<OrderLine[]>([]);
  const [category, setCategory] = useState("Todo");
  const [selectedSize, setSelectedSize] = useState("M");
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [pureClubConsent, setPureClubConsent] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [vipCode, setVipCode] = useState("");
  const [, setLocation] = useLocation();
  const [showDropBack, setShowDropBack] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [forumBody, setForumBody] = useState("");
  const [forumMessage, setForumMessage] = useState("");
  const [vipNotificationsEnabled, setVipNotificationsEnabled] = useState(() => typeof window === "undefined" ? true : window.localStorage.getItem("purekinky-vip-notifications") !== "off");
  const [vipUnreadCount, setVipUnreadCount] = useState(0);
  const seenVipPostIds = useRef<Set<number> | null>(null);
  const [cartSyncMessage, setCartSyncMessage] = useState("");
  const [cartSaveRetry, setCartSaveRetry] = useState(0);
  const newsletterSubscription = trpc.newsletter.subscribe.useMutation();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const isPrimaryAdmin = user?.role === "admin" && normalizeEmail(user.email ?? "") === "danandgal@yahoo.com";
  const adminSiteSettings = trpc.site.adminSettings.useQuery(undefined, {
  enabled: isPrimaryAdmin && activePanel === "maintenance",
});

const updateSiteSettings = trpc.site.update.useMutation();
  const hasLoadedAccountCart = useRef(false);
  const accountCart = trpc.cart.get.useQuery({ accountKey: user?.id ?? 0 }, { enabled: isAuthenticated && Boolean(user?.id) });
  const { mutateAsync: saveAccountCart } = trpc.cart.save.useMutation();
  const vipStatus = trpc.vip.status.useQuery(undefined, { enabled: isAuthenticated });
  const vipUnlock = trpc.vip.unlock.useMutation();
  const vipForum = trpc.vip.forum.list.useQuery(undefined, { enabled: Boolean(vipStatus.data), refetchInterval: 15000 });
  const vipForumPost = trpc.vip.forum.publish.useMutation();
  const campaignMutation = trpc.newsletter.sendCampaign.useMutation();
  const newsletterSubscribers = trpc.newsletter.subscribers.useQuery(undefined, { enabled: isPrimaryAdmin && activePanel === "campaign" });
  const vipModerationMembers = trpc.vip.moderation.members.useQuery(undefined, { enabled: isPrimaryAdmin && Boolean(vipStatus.data) });
  const deleteVipPost = trpc.vip.moderation.deletePost.useMutation({ onSuccess: () => void vipForum.refetch() });
  const banVipMember = trpc.vip.moderation.banUser.useMutation({ onSuccess: () => { void vipModerationMembers.refetch(); void vipForum.refetch(); } });
  const unbanVipMember = trpc.vip.moderation.unbanUser.useMutation({ onSuccess: () => void vipModerationMembers.refetch() });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReducedMotion]);

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

  const menuOpen = activePanel === "menu";
  const cartOpen = activePanel === "cart";
  useEffect(() => { document.body.style.overflow = activePanel || infoPage ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [activePanel, infoPage]);
  
  useEffect(() => {
    const posts = vipForum.data ?? [];
    if (seenVipPostIds.current === null) { seenVipPostIds.current = new Set(posts.map(post => post.id)); return; }
    const newPosts = posts.filter(post => !seenVipPostIds.current!.has(post.id) && post.authorUserId !== user?.id);
    newPosts.forEach(post => seenVipPostIds.current!.add(post.id));
    if (!newPosts.length) return;
    setVipUnreadCount(count => count + newPosts.length);
    const latest = newPosts[0];
    if (isPrimaryAdmin) toast(`Nueva actividad VIP: ${latest.authorName || "un miembro"} ha escrito en el canal.`);
    if (vipNotificationsEnabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("PureKinky VIP", { body: `${latest.authorName || "Un miembro"}: ${latest.body}` });
    }
  }, [vipForum.data, user?.id, isPrimaryAdmin, vipNotificationsEnabled]);

useEffect(() => {
  if (activePanel !== "maintenance" || !adminSiteSettings.data) {
    return;
  }

  const settings = adminSiteSettings.data;

  setMaintenanceEnabledInput(settings.maintenanceEnabled);
  setMaintenanceTitleInput(settings.maintenanceTitle);
  setMaintenanceMessageInput(settings.maintenanceMessage ?? "");

  if (settings.maintenanceEndsAt) {
    const date = new Date(settings.maintenanceEndsAt);

    const pad = (value: number) => String(value).padStart(2, "0");

    const localDateTime =
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}`;

    setMaintenanceEndsAtInput(localDateTime);
  } else {
    setMaintenanceEndsAtInput("");
  }
}, [activePanel, adminSiteSettings.data]);

  const filtered = useMemo(() => category === "Todo" ? catalogProducts : catalogProducts.filter(product => product.category === category), [category]);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);
  const scrollTo = (id: string) => { setActivePanel(closePanels()); setInfoPage(null); document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" }); };
  const configureFromCatalog = (product: CatalogProduct) => { if (product.availability === "Lanzamiento próximo") { toast("Este drop todavía no está disponible."); return; } scrollTo("drops"); toast("Configura tu talla y personalización en Drop 01 antes de añadirla."); };
  const openInfo = (page: InfoPage) => { setActivePanel(closePanels()); setInfoPage(page); };
  const addToCart = (product: CatalogProduct, personalization?: Personalization) => {
    if (product.availability === "Lanzamiento próximo") { toast("Este drop todavía no está disponible."); return; }
    setCart(current => addProductToOrder(current, product, selectedSize, personalization ?? { playerName, playerNumber }));
    if (!personalization) { setPlayerName(""); setPlayerNumber(""); }
    setActivePanel(openPanel("cart"));
  };
  const changeQuantity = (item: OrderLine, nextQuantity: number) => setCart(current => setOrderQuantity(current, item.id, item.size, nextQuantity, item));
  const sendBizumOrder = () => {
    window.open(createBizumWhatsAppUrl(cart, formatPrice(subtotal), BIZUM_NUMBER, WHATSAPP_NUMBER), "_blank", "noopener,noreferrer");
  };
  const onNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (!isAuthenticated) {
        const message = "Inicia sesión o crea una cuenta para unirte a PureClub.";
        setNewsletterMessage(message);
toast(message);
setLocation("/entrar");
return;

      }
      const accountEmail = normalizeEmail(user?.email ?? "");
      if (!isValidEmail(accountEmail)) {
        const message = "Tu cuenta no tiene un email válido. Vuelve a iniciar sesión con una cuenta que tenga email.";
        setNewsletterMessage(message); toast.error(message); return;
      }
      if (!pureClubConsent) {
        const message = "Marca la casilla de consentimiento para activar tu alta en PureClub.";
        setNewsletterMessage(message); toast.error(message); return;
      }
      const result = await newsletterSubscription.mutateAsync({ consent: true, consentVersion: "2026-08-28" });
      const message = result.status === "created" ? "Estás dentro. Te avisaremos antes del próximo drop." : result.status === "renewed" ? "Has vuelto a entrar en PureClub." : "Ya estabas dentro de PureClub.";
      setNewsletterMessage(message); toast.success(message);
      setPureClubConsent(false);
    } catch (error) {
      const message = "No hemos podido registrar tu email. Revisa la dirección e inténtalo de nuevo.";
      setNewsletterMessage(message); toast.error(message);
    }
  };
  const openVip = () => {
  if (!isAuthenticated) {
    setLocation("/entrar");
    return;
  }
    setVipUnreadCount(0);
    setActivePanel(openPanel("vip"));
  };
  const toggleVipNotifications = async () => {
    if (vipNotificationsEnabled) {
      window.localStorage.setItem("purekinky-vip-notifications", "off");
      setVipNotificationsEnabled(false);
      toast("Avisos del chat VIP silenciados en este dispositivo.");
      return;
    }
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    window.localStorage.removeItem("purekinky-vip-notifications");
    setVipNotificationsEnabled(true);
    toast("Avisos del chat VIP activados en este dispositivo.");
  };
  
  const onVipSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await vipUnlock.mutateAsync({ code: vipCode });
      if (!result.granted) { toast.error("ACCESS DENIED — Código no reconocido."); return; }
      setVipCode("");
      await vipStatus.refetch();
      toast.success("ACCESS GRANTED — Bienvenido a PureKinky VIP.");
    } catch { toast.error("El terminal no ha podido verificar el código. Inténtalo de nuevo."); }
  };
  const onSendCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await campaignMutation.mutateAsync({ subject: campaignSubject, body: campaignBody });
      const message = result.sent === 0 ? "No hay suscriptores activos: la campaña no se ha enviado." : `Campaña entregada al servidor de correo para ${result.sent} suscriptor${result.sent === 1 ? "" : "es"}.`;
      setCampaignMessage(message); toast.success(message);
      if (result.sent > 0) { setCampaignSubject(""); setCampaignBody(""); }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "";
      const knownIssue = /PureClub|correo|destinatarios|configuración|conectar/i.test(detail) ? detail : "No se pudo confirmar el envío de la campaña. Revisa la conexión e inténtalo de nuevo.";
      setCampaignMessage(knownIssue); toast.error(knownIssue);
    }
  };
  const onForumSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await vipForumPost.mutateAsync({ body: forumBody });
      setForumBody(""); setForumMessage("Mensaje publicado en el canal VIP.");
      await vipForum.refetch();
    } catch { setForumMessage("No hemos podido publicar el mensaje. Comprueba tu acceso VIP e inténtalo de nuevo."); }
  };
  const heroOffset = prefersReducedMotion ? 0 : Math.min(scrollY * .12, 54);
  const featured = catalogProducts[0];

  useEffect(() => {
    if (!isAuthenticated) { hasLoadedAccountCart.current = false; setCart([]); return; }
    if (!accountCart.isSuccess || hasLoadedAccountCart.current) return;
    setCart(accountCart.data.flatMap(item => {
      const product = catalogProducts.find(candidate => candidate.id === item.productId);
      return product ? [{ ...product, ...item }] : [];
    }));
    hasLoadedAccountCart.current = true;
  }, [accountCart.data, accountCart.isSuccess, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !hasLoadedAccountCart.current) return;
    let retryTimeout: number | undefined;
    const timeout = window.setTimeout(() => {
      void saveAccountCart({ items: cart.map(item => ({ productId: item.id, size: item.size, playerName: item.playerName, playerNumber: item.playerNumber, quantity: item.quantity })) })
        .then(() => setCartSyncMessage(""))
        .catch(() => {
          setCartSyncMessage("No se ha podido guardar el pedido en tu cuenta. Reintentaremos automáticamente.");
          if (cartSaveRetry < 1) retryTimeout = window.setTimeout(() => setCartSaveRetry(attempt => attempt + 1), 1_500);
        });
    }, 250);
    return () => { window.clearTimeout(timeout); if (retryTimeout) window.clearTimeout(retryTimeout); };
  }, [cart, cartSaveRetry, isAuthenticated, saveAccountCart]);

const maintenanceCountdown = formatMaintenanceTime(maintenanceTimeLeft);

  if (maintenanceEnabled && !isPrimaryAdmin) {
  return (
    <main className="maintenance-screen">
      <div className="maintenance-screen__inner">
        <p className="eyebrow eyebrow--pink">PUREKINKY / PRIVATE DROP</p>

        <h1>
          {siteSettings.data?.maintenanceTitle || "PRÓXIMO DROP"}
        </h1>

        <p>
          {siteSettings.data?.maintenanceMessage ||
            "Estamos preparando algo nuevo."}
        </p>
<div className="maintenance-countdown" aria-label="Tiempo restante">
  <div>
    <strong>{maintenanceCountdown.days}</strong>
    <span>DÍAS</span>
  </div>

  <i>:</i>

  <div>
    <strong>{maintenanceCountdown.hours}</strong>
    <span>HORAS</span>
  </div>

  <i>:</i>

  <div>
    <strong>{maintenanceCountdown.minutes}</strong>
    <span>MIN</span>
  </div>

  <i>:</i>

  <div>
    <strong>{maintenanceCountdown.seconds}</strong>
    <span>SEG</span>
  </div>
</div>
        <div className="maintenance-screen__line" />

        <span>PUREKINKY</span>
      </div>
    </main>
  );
}

  return <main className="site-shell">
    <a className="skip-link" href="#drops">Saltar a la colección</a>
    <header className="site-header">
      <button className="brand-mark" onClick={() => scrollTo("top")} aria-label="Ir al inicio de PureKinky">PURE<span>KINKY</span></button>
      <nav className="desktop-nav" aria-label="Navegación principal"><button onClick={() => scrollTo("drops")}>Drops</button><button onClick={() => scrollTo("lookbook")}>Lookbook</button><button onClick={() => scrollTo("pureclub")}>PureClub</button></nav>
      <div className="header-actions">{authLoading ? <span className="auth-status">···</span> : isAuthenticated ? <button className="auth-trigger auth-trigger--signed" onClick={() => void logout()} aria-label="Cerrar sesión">{user?.name?.slice(0, 1).toUpperCase() || "P"}</button> : <button className="auth-trigger" onClick={() => setLocation("/entrar")}>Entrar</button>}<button className="vip-trigger" onClick={openVip}><LockKeyhole size={15} /><span>VIP</span></button><button className="cart-trigger" onClick={() => setActivePanel(openPanel("cart"))} aria-label="Abrir pedido"><ShoppingBag size={18} /><span>Pedido</span>{itemCount > 0 && <b>{itemCount}</b>}</button><button className="menu-trigger" aria-label="Abrir menú" onClick={() => setActivePanel(openPanel("menu"))}><Menu size={22} /></button></div>
    </header>
    {isAuthenticated && cartSyncMessage && <aside className="cart-sync-banner" role="status">{cartSyncMessage} <button type="button" onClick={() => setCartSaveRetry(attempt => attempt + 1)}>Reintentar ahora</button></aside>}

    <section className="hero" id="top">
      <div className="hero__noise" /><div className="hero__orb hero__orb--one" />
      <motion.div className="hero__copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, ease: [.23, 1, .32, 1] }}>
        <p className="eyebrow eyebrow--pink"><span /> PureKinky / Drop 01 — disponible ahora</p><h1>VISTE<br /><em>COMO</em><br />ERES.</h1><p className="hero__intro">Ser puro no es cosa de cualquiera, es como eres.</p>
        <div className="hero__actions"><button className="button button--pink" onClick={() => scrollTo("drops")}>VISTE SIN PERMISO <ArrowDownRight size={18} /></button><button className="button button--ghost" onClick={() => scrollTo("lookbook")}>Descubrir <ArrowRight size={17} /></button></div>
      </motion.div>
      <div className="hero__media" style={{ transform: `translateY(${heroOffset}px)` }}><img src="https://res.cloudinary.com/ly6rnez4/image/upload/f_auto,q_auto/angela_torso" alt="Modelo con la camiseta rosa del Drop 1 PureKinky x Golfo & Puro" fetchPriority="high" /><div className="hero__stamp"><span>PUREKINKY</span><span>DROP 01</span><span>NOT FOR EVERYONE</span></div></div>
      <div className="hero__mobile-drop" aria-hidden="true"><span>DROP<br />01</span><img src="https://res.cloudinary.com/ly6rnez4/image/upload/f_auto,q_auto/espalda_parking" alt="" /></div>
      <button className="hero__scroll" onClick={() => scrollTo("drops")} aria-label="Ir a la colección"><span>SCROLL TO ENTER</span><ChevronDown size={19} /></button>
    </section>

    <div className="ticker" aria-label="Mensajes de marca"><div className="ticker__track"><span>PUREKINKY <i /> STREETWEAR <i /> MADE FOR THE REAL ONES <i /> PUREKINKY <i /> STREETWEAR <i /> MADE FOR THE REAL ONES <i /></span></div></div>
    <section className="drops section" id="drops">
      <motion.div className="section-head" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .3 }} transition={{ duration: .45 }}><div><p className="eyebrow">001 / Collection</p><h2>DROP <em>01</em></h2></div><p>Representa lo que eres. Que tu estética hable antes que tus palabras.</p></motion.div>
      <motion.article className="drop-showcase" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .18 }} transition={{ duration: .5, ease: [.23, 1, .32, 1] }}><button type="button" className="drop-showcase__image" onClick={() => setShowDropBack(current => !current)} aria-label={showDropBack ? "Mostrar vista frontal de la camiseta Drop 01" : "Mostrar vista trasera de la camiseta Drop 01"}><img src={showDropBack ? featured.hoverImage : featured.image} alt={showDropBack ? "Vista trasera de la camiseta Drop 01" : featured.imageAlt} loading="lazy" /><span>{showDropBack ? "VISTA TRASERA · TOCA PARA VOLVER" : "VISTA FRONTAL · TOCA PARA GIRAR"}</span></button><div className="drop-showcase__content"><p className="eyebrow eyebrow--pink">El expositor</p><h3>{featured.name}</h3><p>{featured.description}</p><div className="drop-showcase__meta"><strong>{formatPrice(featured.price)}</strong><span>{featured.availability}</span></div><div className="product-size-selector product-size-selector--showcase"><span>Elige talla</span><div role="group" aria-label="Seleccionar talla para el Drop 01">{featured.sizes.map(size => <button key={size} type="button" aria-pressed={selectedSize === size} className={selectedSize === size ? "is-selected" : ""} onClick={() => setSelectedSize(size)}>{size}</button>)}</div></div><div className="player-customization"><span>Personaliza tu dorsal <i>opcional</i></span><div><label>Nombre<input aria-label="Nombre para camiseta" value={playerName} onChange={event => setPlayerName(event.target.value.slice(0, 20).toUpperCase())} maxLength={20} placeholder="TU NOMBRE" /></label><label>Número<input aria-label="Número para camiseta" value={playerNumber} onChange={event => setPlayerNumber(event.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" maxLength={3} placeholder="10" /></label></div></div><button className="button button--pink" onClick={() => addToCart(featured)}>Añadir talla {selectedSize} <Plus size={17} /></button></div><div className="drop-showcase__back"><img src={featured.hoverImage} alt="Vista trasera de la camiseta Drop 01" loading="lazy" /><span>JUGADOR / 10</span></div></motion.article>
    </section>

    <section className="lookbook section" id="lookbook"><div className="lookbook__headline"><h2>JUEGA<br /><em>CON TUS</em><br />PROPIAS REGLAS.</h2></div><motion.figure className="lookbook__image lookbook__image--one" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}><img src="https://res.cloudinary.com/ly6rnez4/image/upload/f_auto,q_auto/parking_1ratirada" alt="Modelo con el frontal de la camiseta Drop 1 x Golfo & Puro" loading="lazy" /><figcaption>NO. 01 / PUREKINKY × GOLFO & PURO</figcaption></motion.figure><motion.figure className="lookbook__image lookbook__image--two" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: .1 }}><img src="https://res.cloudinary.com/ly6rnez4/image/upload/f_auto,q_auto/espalda_parking" alt="Modelo mostrando la trasera Jugador 10 de la camiseta Drop 1" loading="lazy" /><figcaption>NO. 10 / BACK PRINT</figcaption></motion.figure></section>

    <section className="manifesto" id="movement"><motion.p className="manifesto__small" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>PUREKINKY IS AN ATTITUDE</motion.p><motion.h2 initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .6 }}>NO VENIMOS<br />A ENCAJAR.<br /><span>VENIMOS A<br />SER NOSOTROS.</span></motion.h2><button className="manifesto__link" onClick={() => scrollTo("drops")}>Entrar al drop <ArrowDownRight size={22} /></button></section>

    <section className="catalog section" id="catalog"><div className="section-head catalog__head"><div><h2>ALL <em>DROP</em></h2></div><p>Catálogo abierto. Añade tu selección y confirma el pedido de forma directa.</p></div><div className="catalog__filters" aria-label="Filtrar catálogo">{catalogCategories.map(item => <button key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="catalog__grid">{filtered.map((product, index) => <ProductCard product={product} index={index} key={product.id} onConfigure={configureFromCatalog} />)}</div></section>

    <section className="newsletter section" id="pureclub"><div className="newsletter__tape">PURECLUB / PRIMERO EN ENTERARTE / PURECLUB / PRIMERO EN ENTERARTE /</div><div className="newsletter__inner"><p className="eyebrow eyebrow--pink">PureClub / Acceso anticipado</p><h2>ENTRA EN<br /><em>PURECLUB.</em></h2><p>Drop alerts, acceso anticipado y señales que no llegan a todo el mundo.</p><form onSubmit={onNewsletter} noValidate><div className={`newsletter-account ${isAuthenticated ? "is-connected" : ""}`}><span>{isAuthenticated ? "Cuenta conectada" : "PureClub requiere cuenta"}</span>{isAuthenticated && user?.email ? <strong>{user.email}</strong> : <button type="button" onClick={() => setLocation("/entrar")}>Iniciar sesión o crear cuenta <ArrowRight size={15} /></button>}</div><label className="consent-check" htmlFor="pureclub-consent"><input id="pureclub-consent" type="checkbox" checked={pureClubConsent} onChange={event => { setPureClubConsent(event.target.checked); setNewsletterMessage(""); }} disabled={newsletterSubscription.isPending} /><span>Acepto recibir comunicaciones de PureClub y confirmo haber leído la <a href="#top">política de privacidad</a>.</span></label><button type="submit" disabled={newsletterSubscription.isPending}>{newsletterSubscription.isPending ? "Entrando..." : isAuthenticated ? <>Unirme con mi cuenta <Send size={17} /></> : <>Entrar para unirme <ArrowRight size={17} /></>}</button></form><p id="pureclub-status" className={`newsletter-status ${newsletterMessage ? "is-visible" : ""}`} role="status" aria-live="polite">{newsletterMessage}</p><div className="pureclub-tools"><button className="pureclub-vip" onClick={openVip}><Terminal size={17} /><span>{vipStatus.data ? "VIP VERIFIED / ENTRAR" : "VIP TERMINAL / ACCESO"}</span><ArrowRight size={16} /></button>{isPrimaryAdmin && <button className="pureclub-admin" onClick={() => setActivePanel(openPanel("campaign"))}>Enviar campaña <Send size={15} /></button>}{isPrimaryAdmin && <button className="pureclub-admin" onClick={() => setActivePanel(openPanel("maintenance"))}>Control web <Terminal size={15} /></button>}</div></div></section>

    <footer className="footer"><div className="footer__brand">
  <img
    src="https://res.cloudinary.com/ly6rnez4/image/upload/f_auto,q_auto/PureKinky_Gotico-removebg-preview"
    alt="PureKinky"
  />
  <p>Solo para la gente pura.</p>
</div><div className="footer__links"><button onClick={() => scrollTo("top")}>Inicio</button><button onClick={() => scrollTo("drops")}>Drops</button><button onClick={() => scrollTo("lookbook")}>Lookbook</button><button onClick={() => scrollTo("pureclub")}>PureClub</button><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram <Instagram size={14} /></a><button onClick={() => openInfo("contact")}>Contacto</button></div><div className="footer__legal"><button onClick={() => openInfo("faq")}>FAQ</button><button onClick={() => openInfo("shipping")}>Envíos</button><button onClick={() => openInfo("returns")}>Devoluciones</button><button onClick={() => openInfo("privacy")}>Privacidad</button><button onClick={() => openInfo("terms")}>Términos</button><button onClick={() => openInfo("cookies")}>Cookies</button></div><p className="footer__copy">© 2026 PureKinky.</p></footer>

    <CookieBanner onOpenPolicy={() => openInfo("cookies")} />
    {(activePanel || infoPage) && <div className="overlay" onClick={() => { setActivePanel(closePanels()); setInfoPage(null); }} />}
    <aside className={`side-panel menu-panel ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}><button className="panel-close" onClick={() => setActivePanel(closePanels())} aria-label="Cerrar menú"><X size={23} /></button><p className="eyebrow">Navigation</p>{[["drops", "Drops"], ["lookbook", "Lookbook"], ["pureclub", "PureClub"], ["catalog", "Catálogo"]].map(([id, label]) => <button key={id} onClick={() => scrollTo(id)}>{label}<ArrowRight /></button>)}<button className="menu-vip-link" onClick={openVip}>VIP Terminal <LockKeyhole size={18} /></button><p className="menu-panel__foot">PARA LOS QUE LO LLEVAN<br />A SU MANERA.</p></aside>
    <aside className={`side-panel cart-panel ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen}><div className="cart-panel__head"><div><p className="eyebrow">Tu selección</p><h2>Pedido <span>({itemCount})</span></h2>{isAuthenticated && <p className="cart-account-note">Guardado en tu cuenta</p>}</div><button className="panel-close" onClick={() => setActivePanel(closePanels())} aria-label="Cerrar pedido"><X size={23} /></button></div>{cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={34} /><h3>Tu pedido está vacío.</h3><p>Explora el drop y guarda tu pieza.</p><button className="button button--pink" onClick={() => { setActivePanel(closePanels()); scrollTo("drops"); }}>Ver colección</button></div> : <><div className="cart-lines">{cart.map(item => <div className="cart-line" key={`${item.id}-${item.size}-${item.playerName}-${item.playerNumber}`}><img src={item.image} alt="" /><div><p>{item.name}</p><span>{formatPrice(item.price)} · Talla {item.size}</span>{(item.playerName || item.playerNumber) && <small>Personalización: {[item.playerName, item.playerNumber && `#${item.playerNumber}`].filter(Boolean).join(" · ")}</small>}<div className="quantity"><button onClick={() => changeQuantity(item, item.quantity - 1)} aria-label={`Reducir ${item.name} talla ${item.size}`}><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => changeQuantity(item, item.quantity + 1)} aria-label={`Aumentar ${item.name} talla ${item.size}`}><Plus size={13} /></button></div></div><button className="line-remove" onClick={() => changeQuantity(item, 0)} aria-label={`Eliminar ${item.name} talla ${item.size}`}><X size={15} /></button></div>)}</div><div className="cart-panel__bottom"><div className="cart-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div><div className="bizum-note"><Check size={16} /><p><b>Pago por Bizum</b><br />Revisa tu <strong>talla y personalización</strong>; recibirás el resumen para enviar <strong>{formatPrice(subtotal)}</strong> al {BIZUM_NUMBER}.</p></div><button className="button button--pink button--full" onClick={sendBizumOrder}>Confirmar por WhatsApp <ArrowRight size={18} /></button></div></>}</aside>
    <aside
  className={`side-panel vip-panel ${activePanel === "vip" ? "is-open" : ""}`}
  aria-hidden={activePanel !== "vip"}
>
  <button
    className="panel-close"
    onClick={() => setActivePanel(closePanels())}
    aria-label="Cerrar acceso VIP"
  >
    <X size={23} />
  </button>

  <div className="terminal-heading">
    <Terminal size={20} />
    <p className="eyebrow">PureKinky / Secure gate</p>

    <h2>
      VIP
      <br />
      <span>ACCESS</span>
    </h2>
  </div>

  {vipStatus.data ? (
    <div className="vip-granted">
      <p>&gt; identity verified</p>
      <p>&gt; clearance: pureclub.vip</p>

      <h3>ESTÁS DENTRO.</h3>

      <section className="vip-vault">
        <p>/// PRIVATE CHANNEL</p>

        <h4>
          CLUB
          <br />
          AFTER DARK.
        </h4>

        <span>
          Acceso anticipado a próximos drops, señales privadas y archivos
          de campaña.
        </span>
      </section>

      <section
        className="vip-forum"
        aria-labelledby="vip-forum-title"
      >
        <div className="vip-forum__head">
          <p>/// COMMUNITY CHANNEL</p>

          <h4 id="vip-forum-title">
            FORO
            <br />
            <span>VIP.</span>
          </h4>

          <span>
            Cualquier miembro con acceso concedido puede publicar.
          </span>

          <div className="vip-forum__tools">
            <button
              type="button"
              className="vip-forum__notify"
              onClick={toggleVipNotifications}
              aria-pressed={vipNotificationsEnabled}
              aria-label={
                vipNotificationsEnabled
                  ? "Silenciar notificaciones del chat VIP"
                  : "Activar notificaciones del chat VIP"
              }
            >
              {vipNotificationsEnabled ? (
                <Bell size={14} />
              ) : (
                <BellOff size={14} />
              )}

              {vipNotificationsEnabled
                ? "Silenciar avisos"
                : "Activar avisos"}
            </button>

            {vipUnreadCount > 0 && (
              <span
                className="vip-forum__unread"
                role="status"
              >
                NUEVA ACTIVIDAD · {vipUnreadCount}
              </span>
            )}
          </div>
        </div>

        <div
          className="vip-forum__posts"
          aria-live="polite"
        >
          {vipForum.isLoading ? (
            <p className="vip-forum__empty">
              &gt; cargando canal privado...
            </p>
          ) : vipForum.data?.length ? (
            vipForum.data.map(post => (
              <article
                className="vip-forum__post"
                key={post.id}
              >
                <header>
                  <strong>
                    {post.authorName || "Miembro VIP"}
                  </strong>

                  <time
                    dateTime={new Date(
                      post.createdAt
                    ).toISOString()}
                  >
                    {new Date(
                      post.createdAt
                    ).toLocaleString("es-ES", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                </header>

                <p>{post.body}</p>

                {isPrimaryAdmin && (
                  <div className="vip-post-actions">
                    <button
                      type="button"
                      onClick={() =>
                        deleteVipPost.mutate({
                          postId: post.id,
                        })
                      }
                      disabled={deleteVipPost.isPending}
                      aria-label={`Borrar mensaje de ${
                        post.authorName || "miembro VIP"
                      }`}
                    >
                      <Trash2 size={13} />
                      Borrar
                    </button>

                    {post.authorUserId !== null &&
                      post.authorUserId !== user?.id && (
                        <button
                          type="button"
                          onClick={() =>
                            banVipMember.mutate({
                              userId: post.authorUserId!,
                            })
                          }
                          disabled={banVipMember.isPending}
                          aria-label={`Bloquear a ${
                            post.authorName || "miembro VIP"
                          }`}
                        >
                          <Ban size={13} />
                          Bloquear VIP
                        </button>
                      )}
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="vip-forum__empty">
              &gt; el canal está abierto. Sé la primera voz.
            </p>
          )}
        </div>

        <form
          className="vip-forum__form"
          onSubmit={onForumSubmit}
        >
          <label htmlFor="vip-forum-message">
            Publicar en el foro
          </label>

          <textarea
            id="vip-forum-message"
            value={forumBody}
            onChange={event => {
              setForumBody(event.target.value);
              setForumMessage("");
            }}
            maxLength={800}
            required
            placeholder="Deja una señal para el club..."
          />

          <button
            type="submit"
            disabled={vipForumPost.isPending}
          >
            {vipForumPost.isPending
              ? "PUBLICANDO..."
              : "PUBLICAR MENSAJE"}

            <Send size={15} />
          </button>

          <p
            className="vip-forum__status"
            role="status"
          >
            {forumMessage}
          </p>
        </form>

        {isPrimaryAdmin && (
          <section
            className="vip-moderation"
            aria-labelledby="vip-moderation-title"
          >
            <div className="vip-moderation__head">
              <p>/// ADMIN CONSOLE</p>

              <h4 id="vip-moderation-title">
                MODERAR
                <br />
                <span>VIP.</span>
              </h4>
            </div>

            {vipModerationMembers.isLoading ? (
              <p className="vip-forum__empty">
                &gt; cargando miembros...
              </p>
            ) : vipModerationMembers.data?.length ? (
              <div className="vip-moderation__members">
                {vipModerationMembers.data.map(member => (
                  <div
                    className="vip-moderation__member"
                    key={member.userId}
                  >
                    <div>
                      <strong>
                        {member.name || "Miembro VIP"}
                      </strong>

                      <span>
                        {member.email ||
                          `ID ${member.userId}`}
                      </span>
                    </div>

                    {member.userId === user?.id ? (
                      <small>ADMIN</small>
                    ) : member.bannedAt ? (
                      <button
                        type="button"
                        onClick={() =>
                          unbanVipMember.mutate({
                            userId: member.userId,
                          })
                        }
                        disabled={
                          unbanVipMember.isPending
                        }
                      >
                        Desbloquear
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          banVipMember.mutate({
                            userId: member.userId,
                          })
                        }
                        disabled={
                          banVipMember.isPending
                        }
                      >
                        Bloquear
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="vip-forum__empty">
                &gt; no hay miembros VIP registrados.
              </p>
            )}
          </section>
        )}
      </section>
    </div>
  ) : (
    <form
      className="terminal-form"
      onSubmit={onVipSubmit}
    >
      <p>
        &gt; PUREKINKY / PRIVATE ACCESS
        <br />
        &gt; ACCESS_CODE_REQUIRED
      </p>

      <p className="vip-quiz-code">
        Introduce tu código VIP
      </p>

      <label htmlFor="vip-code">
        Código de acceso
      </label>

      <div>
        <span>&gt;_</span>

        <input
          id="vip-code"
          value={vipCode}
          onChange={event =>
            setVipCode(event.target.value)
          }
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={64}
          placeholder="••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={vipUnlock.isPending}
      >
        {vipUnlock.isPending
          ? "VERIFYING..."
          : "VERIFY ACCESS"}

        <ArrowRight size={17} />
      </button>
    </form>
  )}
</aside>
    {isPrimaryAdmin && <aside className={`side-panel campaign-panel ${activePanel === "campaign" ? "is-open" : ""}`} aria-hidden={activePanel !== "campaign"}><button className="panel-close" onClick={() => setActivePanel(closePanels())} aria-label="Cerrar campaña"><X size={23} /></button><p className="eyebrow eyebrow--pink">PureClub / Admin only</p><h2>ENVIAR<br />SEÑAL.</h2><p>La campaña se entrega ahora desde el correo de PureClub a los suscriptores activos mediante copia oculta.</p><form onSubmit={onSendCampaign}><label htmlFor="campaign-subject">Asunto</label><input id="campaign-subject" value={campaignSubject} onChange={event => { setCampaignSubject(event.target.value); setCampaignMessage(""); }} maxLength={120} required placeholder="DROP 02 / ..." /><label htmlFor="campaign-body">Mensaje</label><textarea id="campaign-body" value={campaignBody} onChange={event => { setCampaignBody(event.target.value); setCampaignMessage(""); }} maxLength={5000} required placeholder="Escribe tu mensaje para PureClub..." /><button className="button button--pink button--full" disabled={campaignMutation.isPending} type="submit">{campaignMutation.isPending ? "Enviando..." : "Enviar campaña ahora"}<Send size={17} /></button><p className="campaign-status" role="status">{campaignMessage}</p></form><section className="campaign-recipients" aria-labelledby="campaign-recipients-title"><div className="campaign-recipients__head"><p className="eyebrow">Base de PureClub</p><h3 id="campaign-recipients-title">CONTACTOS <span>({newsletterSubscribers.data?.length ?? 0})</span></h3></div>{newsletterSubscribers.isLoading ? <p className="campaign-recipients__empty">Cargando contactos…</p> : newsletterSubscribers.data?.length ? <ul>{newsletterSubscribers.data.map(subscriber => <li key={subscriber.id}><span>{subscriber.email}</span><small>{subscriber.isSubscribed ? "ACTIVO" : "BAJA"}</small></li>)}</ul> : <p className="campaign-recipients__empty">No hay contactos registrados.</p>}</section></aside>} {isPrimaryAdmin && (
  <aside
    className={`side-panel maintenance-admin-panel ${
      activePanel === "maintenance" ? "is-open" : ""
    }`}
    aria-hidden={activePanel !== "maintenance"}
  >
    <div className="side-panel__header">
      <div>
        <p className="eyebrow eyebrow--pink">PUREKINKY / ADMIN</p>
        <h2>CONTROL WEB</h2>
      </div>

      <button
        type="button"
        className="side-panel__close"
        onClick={() => setActivePanel(closePanels())}
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>

    <div className="maintenance-admin-panel__body">
      <p className="maintenance-admin-panel__label">
        SITE LOCK
      </p>

      <label className="maintenance-admin-panel__toggle">
        <input
          type="checkbox"
          checked={maintenanceEnabledInput}
          onChange={event =>
            setMaintenanceEnabledInput(event.target.checked)
          }
        />
        <span>
          {maintenanceEnabledInput ? "ACTIVADO" : "DESACTIVADO"}
        </span>
      </label>

      <label className="maintenance-admin-panel__field">
        <span>FINALIZA</span>
        <input
          type="datetime-local"
          value={maintenanceEndsAtInput}
          onChange={event =>
            setMaintenanceEndsAtInput(event.target.value)
          }
        />
      </label>

      <label className="maintenance-admin-panel__field">
        <span>TÍTULO</span>
        <input
          type="text"
          value={maintenanceTitleInput}
          onChange={event =>
            setMaintenanceTitleInput(event.target.value)
          }
          maxLength={120}
        />
      </label>

      <label className="maintenance-admin-panel__field">
        <span>MENSAJE</span>
        <textarea
          value={maintenanceMessageInput}
          onChange={event =>
            setMaintenanceMessageInput(event.target.value)
          }
          rows={5}
          maxLength={1000}
        />
      </label>

      <button
  type="button"
  className="maintenance-admin-panel__save"
  disabled={updateSiteSettings.isPending}
  onClick={async () => {
    try {
      console.log("FECHA DEL CONTADOR:", maintenanceEndsAtInput);

      await updateSiteSettings.mutateAsync({
        maintenanceEnabled: maintenanceEnabledInput,
        maintenanceEndsAt: maintenanceEndsAtInput
          ? new Date(maintenanceEndsAtInput)
          : null,
        maintenanceTitle: maintenanceTitleInput.trim(),
        maintenanceMessage: maintenanceMessageInput.trim() || null,
      });

      await siteSettings.refetch();
      await adminSiteSettings.refetch();
    } catch (error) {
      console.error("No se pudo guardar la configuración:", error);
    }
  }}
>
  {updateSiteSettings.isPending ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
</button>
    </div>
  </aside>
)}
    <InfoPanel page={infoPage} onClose={() => setInfoPage(null)} />
  </main>;
}

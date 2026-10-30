/* PodoLogIQ : vitrine. Aucune dépendance, aucun cookie, aucune mesure d'audience. */
(() => {
  /** À renseigner avant la mise en ligne (voir LISEZ-MOI.md). */
  const CONFIG = {
    emailContact: "contact@exemple.invalid",
    /** Adresse de connexion à l'application ; vide : le lien « Se connecter » reste masqué. */
    urlApplication: "",
  };

  const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointeurFin = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const borne = (v) => Math.max(0, Math.min(1, v));

  const lienApplication = document.querySelector("[data-lien-application]");
  if (lienApplication && CONFIG.urlApplication) {
    lienApplication.href = CONFIG.urlApplication;
    lienApplication.hidden = false;
  }

  // Menu du téléphone.
  const burger = document.querySelector(".burger");
  const menu = document.getElementById("menu");
  const basculerMenu = (ouvert) => {
    menu.classList.toggle("ouvert", ouvert);
    burger.setAttribute("aria-expanded", String(ouvert));
    burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
  };
  burger.addEventListener("click", () => basculerMenu(!menu.classList.contains("ouvert")));
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) basculerMenu(false);
  });

  // Apparitions au défilement, en cascade dans un même groupe.
  const groupes = new WeakMap();
  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const { isIntersecting, target } of entrees) {
        if (!isIntersecting) continue;
        const parent = target.parentElement;
        const rang = groupes.get(parent) ?? 0;
        groupes.set(parent, rang + 1);
        target.style.setProperty("--retard", `${Math.min(rang, 6) * 80}ms`);
        target.classList.add("visible");
        observateur.unobserve(target);
        // Une fois apparu, l'élément retrouve ses propres transitions (survol des cartes).
        setTimeout(() => {
          target.classList.remove("revele", "visible");
          target.style.removeProperty("--retard");
        }, 1500 + Math.min(rang, 6) * 80);
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
  );
  document.querySelectorAll(".revele").forEach((el) => observateur.observe(el));

  // Compteurs.
  const compteurs = new IntersectionObserver((entrees) => {
    for (const { isIntersecting, target } of entrees) {
      if (!isIntersecting) continue;
      compteurs.unobserve(target);
      const fin = Number(target.dataset.compteur);
      if (reduit) continue;
      const debut = performance.now();
      const pas = (t) => {
        const p = Math.min((t - debut) / 1400, 1);
        target.textContent = String(Math.round(fin * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    }
  });
  document.querySelectorAll("[data-compteur]").forEach((el) => compteurs.observe(el));

  // Frise de la journée : une courbe relie les cinq points, à la manière du logo.
  const frise = document.getElementById("frise");
  const trace = document.getElementById("frise-trace");
  const traceVive = trace.querySelector(".trace-vive");
  const dessinerTrace = () => {
    const cadre = trace.getBoundingClientRect();
    if (!cadre.width) return;
    const centres = [...frise.querySelectorAll(".rond")].map((rond) => {
      const r = rond.getBoundingClientRect();
      return [r.left + r.width / 2 - cadre.left, r.top + r.height / 2 - cadre.top];
    });
    let d = `M${centres[0][0]} ${centres[0][1]}`;
    for (let i = 1; i < centres.length; i++) {
      const [x0, y0] = centres[i - 1];
      const [x1, y1] = centres[i];
      d += ` C${x0 + (x1 - x0) * 0.5} ${y0} ${x0 + (x1 - x0) * 0.5} ${y1} ${x1} ${y1}`;
    }
    trace.setAttribute("viewBox", `0 0 ${cadre.width} ${cadre.height}`);
    trace.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
  };
  new ResizeObserver(dessinerTrace).observe(frise);

  // Tout ce qui suit le défilement, regroupé sur une seule image d'animation.
  const sceneHeros = document.getElementById("scene-heros");
  const trajectoire = document.getElementById("trajectoire");
  const panneau = document.getElementById("securite-panneau");
  const retour = document.getElementById("retour-haut");
  const retourAvance = retour.querySelector(".retour-avance");
  let attente = false;
  const majDefilement = () => {
    attente = false;
    const h = innerHeight;
    const total = document.documentElement.scrollHeight - h;
    retourAvance.style.strokeDashoffset = String(1 - (total > 0 ? scrollY / total : 0));
    retour.classList.toggle("visible", scrollY > h * 0.8);
    if (reduit) {
      traceVive.style.setProperty("--decale", "0");
      return;
    }
    sceneHeros.style.setProperty("--p", String(borne((h - sceneHeros.getBoundingClientRect().top - h * 0.28) / (h * 0.55))));
    trajectoire.style.setProperty("--sy", String(scrollY));
    const f = frise.getBoundingClientRect();
    traceVive.style.setProperty("--decale", String(1 - borne((h * 0.72 - f.top) / f.height)));
    panneau.style.setProperty("--p", String(borne((h - panneau.getBoundingClientRect().top) / (h * 0.8))));
  };
  addEventListener("scroll", () => {
    if (!attente) {
      attente = true;
      requestAnimationFrame(majDefilement);
    }
  }, { passive: true });
  addEventListener("resize", majDefilement, { passive: true });
  majDefilement();

  // Entrée du menu de la section affichée.
  const liens = [...menu.querySelectorAll("a")];
  const sections = new IntersectionObserver((entrees) => {
    for (const { isIntersecting, target } of entrees) {
      if (!isIntersecting) continue;
      for (const l of liens) {
        if (l.getAttribute("href") === `#${target.id}`) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => sections.observe(s));

  // Sous le pointeur : lueur de fond, lueur des cartes, et points du logo qui s'écartent légèrement.
  if (pointeurFin && !reduit) {
    const halo = document.querySelector(".halo-souris");
    document.addEventListener("pointermove", (e) => {
      halo.style.opacity = "1";
      halo.style.translate = `${e.clientX}px ${e.clientY}px`;
      trajectoire.style.setProperty("--mx", String(e.clientX / innerWidth - 0.5));
      trajectoire.style.setProperty("--my", String(e.clientY / innerHeight - 0.5));
      const carte = e.target.closest?.(".carte");
      if (!carte) return;
      const r = carte.getBoundingClientRect();
      carte.style.setProperty("--x", `${e.clientX - r.left}px`);
      carte.style.setProperty("--y", `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  // Visite guidée : chaque écran s'ouvre en cercle ; avance seule tant qu'on ne choisit pas soi-même.
  const visite = document.querySelector("[data-visite]");
  const liste = visite.querySelector(".visite-onglets");
  const onglets = [...visite.querySelectorAll('[role="tab"]')];
  const images = visite.querySelector("[data-visite-images]");
  const titre = visite.querySelector("[data-visite-titre]");
  const texte = visite.querySelector("[data-visite-texte]");
  const DUREE = 7000;
  let minuteur = 0;
  let automatique = !reduit;
  let visible = false;
  let demande = 0;
  liste.style.setProperty("--duree", `${DUREE}ms`);
  const marquer = (onglet) => {
    onglets.forEach((o) => {
      o.setAttribute("aria-selected", String(o === onglet));
      o.tabIndex = o === onglet ? 0 : -1;
    });
    titre.textContent = onglet.dataset.titre;
    texte.textContent = onglet.dataset.texte;
  };
  const choisir = async (onglet, origine) => {
    marquer(onglet);
    const numero = ++demande;
    const nouvelle = new Image(1800, 1125);
    nouvelle.src = `assets/captures/${onglet.dataset.image}.webp`;
    nouvelle.alt = `${onglet.dataset.titre} de PodoLogIQ sur un cabinet de démonstration, données fictives.`;
    await nouvelle.decode().catch(() => {});
    if (numero !== demande) return;
    images.append(nouvelle);
    const retirerAnciennes = () => {
      while (images.firstElementChild !== nouvelle) images.firstElementChild.remove();
      nouvelle.removeAttribute("style");
    };
    if (reduit) return retirerAnciennes();
    const { x, y } = origine ?? { x: "8%", y: "92%" };
    nouvelle.animate(
      { clipPath: [`circle(0% at ${x} ${y})`, `circle(125% at ${x} ${y})`] },
      { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    ).finished.then(retirerAnciennes, () => {});
  };
  const programmer = () => {
    clearTimeout(minuteur);
    liste.classList.toggle("manuel", !automatique);
    if (!automatique || !visible) return;
    minuteur = setTimeout(() => {
      const i = onglets.findIndex((o) => o.getAttribute("aria-selected") === "true");
      choisir(onglets[(i + 1) % onglets.length]);
      programmer();
    }, DUREE);
  };
  const arreterAutomatique = () => {
    automatique = false;
    programmer();
  };
  /** Le cercle part du haut de l'image, à l'aplomb du bouton choisi. */
  const origineDepuis = (onglet) => {
    const b = onglet.getBoundingClientRect();
    const r = images.getBoundingClientRect();
    return { x: `${Math.round(borne((b.left + b.width / 2 - r.left) / r.width) * 100)}%`, y: "0%" };
  };
  onglets.forEach((o, i) => {
    o.addEventListener("click", () => {
      arreterAutomatique();
      choisir(o, origineDepuis(o));
      o.scrollIntoView({ block: "nearest", inline: "center", behavior: reduit ? "auto" : "smooth" });
    });
    o.addEventListener("keydown", (e) => {
      const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const suivant = onglets[(i + delta + onglets.length) % onglets.length];
      arreterAutomatique();
      choisir(suivant, origineDepuis(suivant));
      suivant.focus();
    });
  });
  marquer(onglets[0]);
  let prechargees = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !prechargees) {
      prechargees = true;
      onglets.forEach((o) => {
        new Image().src = `assets/captures/${o.dataset.image}.webp`;
      });
    }
    programmer();
  }, { threshold: 0.25 }).observe(visite);

  // Demande de démonstration : prépare un message, rien n'est envoyé ni enregistré ici.
  const formulaire = document.getElementById("formulaire");
  formulaire.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = formulaire.querySelector(".formulaire-note");
    let valide = true;
    for (const champ of formulaire.querySelectorAll("[required]")) {
      const ok = champ.checkValidity();
      champ.setAttribute("aria-invalid", String(!ok));
      valide &&= ok;
    }
    if (!valide) {
      note.textContent = "Merci de renseigner votre nom et une adresse e-mail valide.";
      note.classList.add("erreur");
      formulaire.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    note.classList.remove("erreur");
    note.textContent = "Votre messagerie s'ouvre avec la demande déjà rédigée.";
    const d = new FormData(formulaire);
    const corps = [
      `Nom : ${d.get("nom")}`,
      `Cabinet : ${d.get("cabinet")}`,
      `E-mail : ${d.get("email")}`,
      `Nombre de praticiens : ${d.get("praticiens")}`,
      "",
      String(d.get("message")),
    ].join("\n");
    location.href = `mailto:${CONFIG.emailContact}?subject=${encodeURIComponent("Demande de démonstration PodoLogIQ")}&body=${encodeURIComponent(corps)}`;
  });
})();

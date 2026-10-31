/* PodoLogIQ : mesure d'audience Google, seulement après accord du visiteur. Commun à l'accueil et à la démo. */
(() => {
  /** Vide : ni bandeau ni balise. */
  const CONFIG = { idGoogleAnalytics: "G-YZK5JY8G25" };

  // Mesure d'audience : la balise n'est chargée qu'après un accord explicite ; refuser est aussi simple qu'accepter.
  // Le choix reste sur cet appareil, et se modifie depuis le pied de page. Le contenu du formulaire n'est jamais envoyé.
  const CLE_CONSENTEMENT = "podologiq.vitrine.audience";
  const lireChoix = () => {
    try {
      const c = JSON.parse(localStorage.getItem(CLE_CONSENTEMENT));
      // Choix redemandé après 6 mois.
      return c && Date.now() - c.date < 182 * 864e5 ? c.choix : null;
    } catch {
      return null;
    }
  };
  let baliseChargee = false;
  const chargerBalise = () => {
    if (baliseChargee) return;
    baliseChargee = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.idGoogleAnalytics);
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.idGoogleAnalytics}`;
    document.head.append(script);
  };
  const bandeau = document.getElementById("consentement");
  const lienChoix = document.getElementById("gerer-cookies");
  if (CONFIG.idGoogleAnalytics) {
    const choix = lireChoix();
    if (choix === "accepte") chargerBalise();
    bandeau.hidden = choix !== null;
    lienChoix.hidden = false;
    lienChoix.addEventListener("click", () => {
      bandeau.hidden = false;
      bandeau.querySelector("button").focus();
    });
    bandeau.addEventListener("click", (e) => {
      const nouveau = e.target.closest("[data-choix]")?.dataset.choix;
      if (!nouveau) return;
      try {
        localStorage.setItem(CLE_CONSENTEMENT, JSON.stringify({ choix: nouveau, date: Date.now() }));
      } catch {}
      bandeau.hidden = true;
      if (nouveau === "accepte") chargerBalise();
      // Accord retiré : on recharge sans la balise, et on efface ses cookies.
      else if (baliseChargee) {
        for (const { 0: nom } of document.cookie.split("; ").map((c) => c.split("="))) {
          if (nom.startsWith("_ga")) for (const d of ["", `; domain=${location.hostname}`, `; domain=.${location.hostname.split(".").slice(-2).join(".")}`]) document.cookie = `${nom}=; path=/; max-age=0${d}`;
        }
        location.reload();
      }
    });
  }
})();

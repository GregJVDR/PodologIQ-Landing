/* PodoLogIQ : démo simulée. L'adresse e-mail part vers le service d'e-mails et ne sert à rien d'autre ; Google Analytics
   ne reçoit que des étapes, jamais l'adresse. Tout le reste est fictif et ne quitte pas le navigateur. */
(() => {
  /** À renseigner avant la mise en ligne (voir LISEZ-MOI.md) : les adresses d'envoi des deux formulaires Brevo. */
  const CONFIG = {
    /** Tous ceux qui lancent la démo. Vide : l'adresse n'est envoyée nulle part. */
    formulaireEmails: "",
    /** Ceux qui cliquent sur « Je veux PodoLogIQ ». */
    formulaireInteresses: "",
    /** Le code du lien envoyé par Brevo : demo.html?confirme=CODE. Vide : la démo ne s'ouvre pas, sauf aperçu local. */
    codeConfirmation: "",
  };
  const CLE = "podologiq.vitrine.acces";
  const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const ico = (nom, classe = "") => `<svg class="ico ${classe}" aria-hidden="true"><use href="#i-${nom}"/></svg>`;
  const euros = (n) => `${n.toFixed(2).replace(".", ",")} €`;
  const aujourdhui = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date());
  const maintenant = new Date();
  const numero = (rang) => `${maintenant.getFullYear()}${String(maintenant.getMonth() + 1).padStart(2, "0")}${String(rang).padStart(4, "0")}`;

  /** Sur cet appareil : l'adresse saisie, et si son lien a été validé. Le lien peut s'ouvrir sur un autre appareil : la
   * démo s'y ouvre aussi, sans adresse connue. Vu la démo, entièrement fictive, c'est une barrière d'envie, pas de sécurité. */
  let acces = { email: null, confirme: false };
  const lireAcces = () => {
    try {
      return { email: null, confirme: false, ...JSON.parse(localStorage.getItem(CLE)) };
    } catch {
      return { email: null, confirme: false };
    }
  };
  const enregistrerAcces = () => {
    try {
      localStorage.setItem(CLE, JSON.stringify(acces));
    } catch {}
  };
  acces = lireAcces();

  const mesurer = (evenement) => window.gtag?.("event", evenement);
  /** Réponse illisible (formulaire d'un autre site) : seule une panne de réseau se voit. Faux : l'envoi n'a pas abouti. */
  function envoyer(url, adresse) {
    if (!url) return Promise.resolve(false);
    const d = new FormData();
    d.set("EMAIL", adresse);
    d.set("email_address_check", "");
    d.set("locale", "fr");
    return fetch(url, { method: "POST", mode: "no-cors", body: d }).then(
      () => true,
      () => false,
    );
  }

  const ECRANS = ["porte", "attente", "demo", "fin"];
  const montrer = (ecran) => ECRANS.forEach((id) => ($(id).hidden = id !== ecran));
  const adresseValide = (champ) => champ.checkValidity() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(champ.value.trim());

  const compteur = (el, fin, format = (n) => String(Math.round(n))) => {
    if (reduit) return void (el.textContent = format(fin));
    const debut = performance.now();
    const pas = (t) => {
      const p = Math.min((t - debut) / 1100, 1);
      el.textContent = format(fin * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  };

  // --- Les cinq scènes -------------------------------------------------------------------------------------------------
  const COULEURS = { soin: "var(--vert)", verrue: "var(--ciel)", semelles: "var(--rose)", suivi: "var(--turquoise-doux)" };
  const RDV = [
    ["Lun.", [["09:30", "Alice EXEMPLE", "soin"], ["11:00", "Bruno FICTIF", "verrue"], ["14:15", "Élise MODELE", "semelles"]]],
    ["Mar.", [["09:00", "Hugo TESTEUR", "soin"], ["10:30", "Inès MAQUETTE", "suivi"]]],
    ["Mer.", [["09:15", "Jules SPECIMEN", "semelles"], ["11:30", "Gaëlle EXEMPLE", "soin"], ["15:00", "Fabien FICTIF", "soin"]]],
    ["Jeu.", [["10:00", "Camille MODELE", "verrue"], ["13:30", "Dominique TESTEUR", "soin"]]],
    ["Ven.", [["09:30", "Alice FICTIF", "suivi"], ["11:15", "Bruno MAQUETTE", "soin"]]],
  ];
  const GESTES = ["Coupe d'ongles", "Fraisage des ongles"];
  const PATHOLOGIES = ["Cor retiré", "Verrue plantaire traitée"];
  const JOURNEE = [
    ["Alice EXEMPLE", "Soin de pédicurie", "soin", 35, "CB"],
    ["Bruno FICTIF", "Traitement de verrue", "verrue", 35, "Chèque"],
    ["Élise MODELE", "Bilan et semelles", "semelles", 180, "CB"],
    ["Hugo TESTEUR", "Soin de pédicurie", "soin", 35, "Espèces"],
    ["Inès MAQUETTE", "Suivi", "suivi", 40, "Chèque"],
  ];
  const CHEQUES = [
    ["Bruno FICTIF", "0001451", 35],
    ["Inès MAQUETTE", "0001452", 40],
    ["Gaëlle EXEMPLE", "0001453", 35],
  ];
  const VERROUS = [
    ["Stérilisation", "Tests de vide, Helix, cycles prions et kits, reliés à chaque soin", "shield-check"],
    ["Redevances", "Le relevé de chaque collaborateur, à son taux", "users"],
    ["Stocks", "Articles, seuils d'alerte et fournisseurs", "package"],
    ["Aide à la facturation", "Tarif, remboursement et reste à régler, en un coup d'œil", "calculator"],
  ];

  /** Ce que le logiciel complet ajoute à la scène, sous le bilan : la démo n'en montre qu'un mini-aperçu. */
  const VERROUS_MENU = [
    ["Ordonnances, certificats", "file-text"],
    ["Stérilisation", "shield-check"],
    ["Stocks, fournisseurs", "package"],
    ["Redevances", "users"],
    ["Charges et rapports", "chart-column"],
    ["Aide à la facturation", "calculator"],
    ["Réglages du cabinet", "sliders-horizontal"],
  ];
  /** Droits relevés sur l'application : sections de lib/auth/permissions.ts et portée de chaque rôle. */
  const ROLES = {
    titulaire: {
      nom: "Titulaire",
      phrase: "Vous dirigez le cabinet : vous voyez tout, ou un seul praticien à la fois.",
      droits: [["oui", "Agenda et patients"], ["oui", "Relevés et devis de tout le cabinet"], ["oui", "Comptes rendus et ordonnances"], ["oui", "Dépôts et stérilisation"], ["oui", "Comptabilité et redevances"], ["oui", "Comptes de l'équipe et réglages"]],
      agenda: ["Alice EXEMPLE", "Bruno FICTIF", "Élise MODELE"],
    },
    collaborateur: {
      nom: "Collaborateur",
      phrase: "Soigne et suit ses propres chiffres. Chacun sa signature, son RIB et sa série de numéros.",
      droits: [["oui", "Son agenda : les autres apparaissent « Occupé »"], ["oui", "Ses relevés et ses devis, seulement"], ["oui", "Comptes rendus et ordonnances"], ["oui", "Ses dépôts, la stérilisation"], ["oui", "Ses chiffres et sa redevance"], ["non", "Comptabilité du cabinet, comptes et réglages"]],
      agenda: ["Occupé", "Bruno FICTIF", "Occupé"],
    },
    secretaire: {
      nom: "Secrétaire",
      phrase: "À l'accueil : l'agenda, les patients et les règlements. Rédiger le soin reste aux soignants.",
      droits: [["oui", "Agenda et patients de tout le cabinet"], ["oui", "Relevés, devis, courriers et certificats"], ["non", "Rédaction des comptes rendus et ordonnances"], ["oui", "Dépôts et stérilisation"], ["non", "Chiffre d'affaires et comptabilité"], ["non", "Comptes et réglages"]],
      agenda: ["Alice EXEMPLE", "Bruno FICTIF", "Élise MODELE"],
    },
  };
  const REGLAGES = ["Modules à activer ou masquer", "Accueil à composer", "Actes, tarifs et règles de facturation", "Logo, signature et cachet", "Mode nuit"];
  /** Mêmes couleurs que le réglage de l'application (Mon compte). */
  const THEMES = [["Marine", "#002750", "#2dbdae"], ["Canard", "#00424a", "#7fdccf"], ["Sapin", "#123f2d", "#8fdc9f"], ["Prune", "#3d1f52", "#d9a8f0"], ["Ardoise", "#2a3542", "#b7c7d9"], ["Brique", "#6b2a1c", "#f4a88c"]];

  function bravo(texte, suite, plus = "") {
    const b = document.createElement("div");
    b.className = "demo-bravo";
    b.innerHTML = `<span class="demo-bravo-coche">${ico("check")}</span><p>${texte}${plus ? `<small>Dans le logiciel complet : ${plus}</small>` : ""}</p><button type="button" class="demo-bouton a-cliquer">${indice === SCENES.length - 1 ? "Voir le résultat" : "Continuer"} ${ico("arrow-right")}</button>`;
    b.querySelector("button").addEventListener("click", suite);
    $("scene").firstElementChild.append(b);
    if (!etapesFaites.has(indice)) {
      etapesFaites.add(indice);
      majMenu();
    }
    b.scrollIntoView({ block: "nearest", behavior: reduit ? "auto" : "smooth" });
    b.querySelector("button").focus({ preventScroll: true });
  }

  const SCENES = [
    {
      menu: "Agenda",
      icone: "calendar-days",
      moment: "Le matin",
      titre: "Vos rendez-vous arrivent tout seuls.",
      consigne: "Fini la double saisie. Importez votre export Doctolib, et regardez votre semaine.",
      jouer(z) {
        const jours = () => RDV.map(([jour]) => `<div class="demo-jour"><b>${jour}</b><div></div></div>`).join("");
        z.insertAdjacentHTML("beforeend", `<div class="demo-carte demo-agenda">${jours()}<div class="demo-depot"><span class="demo-fichier">${ico("file-text")} export-doctolib.csv</span><button type="button" class="demo-bouton a-cliquer">${ico("upload")} Importer le fichier</button></div></div>`);
        z.querySelector(".demo-depot button").focus({ preventScroll: true });
        z.querySelector(".demo-depot button").addEventListener("click", () => {
          z.querySelector(".demo-depot").remove();
          let n = 0;
          const colonnes = z.querySelectorAll(".demo-jour > div");
          RDV.forEach(([, lignes], c) => {
            colonnes[c].innerHTML = lignes.map(([h, nom, type]) => `<div class="demo-rdv" style="--c:${COULEURS[type]};--n:${n++}"><b>${h}</b>${nom}</div>`).join("");
          });
          setTimeout(() => bravo(`<strong>${n} rendez-vous importés.</strong> Chacun à son praticien, et importer à nouveau ne crée pas de doublon.`, suivante, "absences, notes récurrentes, un agenda par praticien."), reduit ? 0 : n * 70 + 500);
        });
      },
    },
    {
      menu: "Patients",
      icone: "footprints",
      moment: "En séance",
      titre: "Le compte rendu s'écrit pendant que vous soignez.",
      consigne: "Cochez ce que vous avez fait pour Alice. Regardez le document à droite.",
      jouer(z) {
        const choix = new Set();
        const puce = (t) => `<button type="button" class="demo-puce a-cliquer" aria-pressed="false" data-choix="${t}">${t}</button>`;
        z.insertAdjacentHTML("beforeend", `<div class="demo-deux"><div class="demo-carte demo-soin"><div class="demo-patient"><span class="demo-avatar">AE</span><div><b>Alice EXEMPLE</b><small>Soin de pédicurie · 09:30</small></div></div><p class="demo-groupe">Gestes réalisés</p><div class="demo-puces">${GESTES.map(puce).join("")}</div><p class="demo-groupe">Pathologies</p><div class="demo-puces">${PATHOLOGIES.map(puce).join("")}</div><button type="button" class="demo-bouton" id="enregistrer" style="margin-top:1.25rem" disabled>Enregistrer le soin</button></div><div class="demo-carte demo-papier"><h3>Compte-rendu de pédicurie</h3><small>Alice EXEMPLE</small><div class="demo-texte" id="texte" aria-live="polite"></div></div></div>`);
        const texte = z.querySelector("#texte");
        const ecrire = () => {
          const liste = (titre, valeurs) => {
            const v = valeurs.filter((x) => choix.has(x));
            return v.length ? `<span style="margin-top:.6rem;font-weight:600">${titre} :</span>${v.map((x) => `<span data-l="${x}">- ${x}</span>`).join("")}` : "";
          };
          const avant = new Set([...texte.querySelectorAll("[data-l]")].map((e) => e.dataset.l));
          texte.innerHTML = choix.size ? `<span>Consultation du ${aujourdhui} à 09:30.</span>${liste("Gestes réalisés", GESTES)}${liste("Pathologies", PATHOLOGIES)}` : "";
          texte.querySelectorAll("[data-l]").forEach((e) => {
            if (avant.has(e.dataset.l)) e.style.animation = "none";
          });
          z.querySelector("#enregistrer").disabled = !choix.size;
          z.querySelector("#enregistrer").classList.toggle("a-cliquer", choix.size > 0);
        };
        z.querySelectorAll(".demo-puce").forEach((b) =>
          b.addEventListener("click", () => {
            const v = b.dataset.choix;
            if (!choix.delete(v)) choix.add(v);
            b.setAttribute("aria-pressed", String(choix.has(v)));
            z.querySelectorAll(".demo-puce").forEach((p) => p.classList.remove("a-cliquer"));
            ecrire();
          }),
        );
        z.querySelector("#enregistrer").addEventListener("click", (e) => {
          e.currentTarget.disabled = true;
          e.currentTarget.classList.remove("a-cliquer");
          z.querySelectorAll(".demo-puce").forEach((p) => (p.disabled = true));
          texte.insertAdjacentHTML("afterend", `<span class="demo-numero">Compte rendu n° ${numero(18)}</span>`);
          bravo("<strong>Pas une ligne à retaper.</strong> Le compte rendu est numéroté et rangé dans le dossier d'Alice.", suivante, "antécédents, documents joints, semelles, ordonnances, certificats, courriers, kits stérilisés.");
        });
      },
    },
    {
      menu: "État préparatoire",
      icone: "receipt-text",
      moment: "Le soir",
      titre: "Toute la journée, en un seul écran.",
      consigne: "Vos patients, leurs actes et leurs règlements sont déjà là. Il ne reste qu'à valider.",
      jouer(z) {
        const total = (mode) => JOURNEE.filter((l) => !mode || l[4] === mode).reduce((s, l) => s + l[3], 0);
        z.insertAdjacentHTML("beforeend", `<div class="demo-carte demo-table-cadre"><table class="demo-table demo-table-journee"><thead><tr><th>Patient</th><th>Actes</th><th class="nombre">À régler</th><th>Règlement</th><th>Relevé</th></tr></thead><tbody>${JOURNEE.map(([nom, acte, type, m, mode]) => `<tr><td>${nom}</td><td><span class="demo-acte" style="--c:${COULEURS[type]}">${acte}</span></td><td class="nombre">${euros(m)}</td><td>${mode}</td><td><span class="demo-etat">À créer</span></td></tr>`).join("")}</tbody></table></div><div class="demo-actions"><div class="demo-totaux"><span>Total <b>${euros(total())}</b></span><span>CB <b>${euros(total("CB"))}</b></span><span>Chèques <b>${euros(total("Chèque"))}</b></span><span>Espèces <b>${euros(total("Espèces"))}</b></span></div><button type="button" class="demo-bouton a-cliquer" id="valider">${ico("check")} Valider la journée</button></div>`);
        z.querySelector("#valider").focus({ preventScroll: true });
        z.querySelector("#valider").addEventListener("click", (e) => {
          e.currentTarget.disabled = true;
          e.currentTarget.classList.remove("a-cliquer");
          z.querySelectorAll(".demo-etat").forEach((s, i) => {
            s.className = "demo-etat fait";
            s.style.setProperty("--retard", `${i * 130}ms`);
            s.innerHTML = `${ico("check")} ${numero(41 + i)}`;
          });
          setTimeout(() => bravo("<strong>5 relevés créés en un clic.</strong> Numérotés, à l'identité du praticien, prêts à imprimer.", suivante, "tiers payant AMO et AMC, ALD et CSS, devis, règles de facturation par motif."), reduit ? 0 : 800);
        });
      },
    },
    {
      menu: "Dépôts",
      icone: "landmark",
      moment: "Dans la semaine",
      titre: "La banque, sans la calculatrice.",
      consigne: "Sélectionnez les chèques à déposer : le total et le bordereau suivent.",
      jouer(z) {
        const choisis = new Set();
        z.insertAdjacentHTML("beforeend", `<div class="demo-carte demo-table-cadre"><table class="demo-table"><thead><tr><th></th><th>N° de chèque</th><th>Patient</th><th class="nombre">Montant</th></tr></thead><tbody>${CHEQUES.map(([nom, n, m], i) => `<tr><td><button type="button" class="demo-case a-cliquer" aria-pressed="false" aria-label="Déposer le chèque de ${nom}" data-i="${i}">${ico("check")}</button></td><td>${n}</td><td>${nom}</td><td class="nombre">${euros(m)}</td></tr>`).join("")}</tbody></table></div><div class="demo-actions"><div class="demo-totaux"><span><b id="nb">0</b> chèque(s)</span><span>Total <b id="tot">${euros(0)}</b></span></div><button type="button" class="demo-bouton" id="remise" disabled>Préparer la remise</button></div>`);
        const somme = () => [...choisis].reduce((s, i) => s + CHEQUES[i][2], 0);
        z.querySelectorAll(".demo-case").forEach((b) =>
          b.addEventListener("click", () => {
            const i = Number(b.dataset.i);
            if (!choisis.delete(i)) choisis.add(i);
            b.setAttribute("aria-pressed", String(choisis.has(i)));
            z.querySelector("#nb").textContent = choisis.size;
            z.querySelector("#tot").textContent = euros(somme());
            const r = z.querySelector("#remise");
            r.disabled = !choisis.size;
            r.classList.toggle("a-cliquer", choisis.size > 0);
            z.querySelectorAll(".demo-case").forEach((c) => c.classList.remove("a-cliquer"));
          }),
        );
        z.querySelector("#remise").addEventListener("click", (e) => {
          e.currentTarget.disabled = true;
          e.currentTarget.classList.remove("a-cliquer");
          z.querySelectorAll(".demo-case").forEach((c) => (c.disabled = true));
          e.currentTarget.parentElement.insertAdjacentHTML("afterend", `<div class="demo-bordereau"><div><b>Remise RC-${numero(1)}</b>${choisis.size} chèque(s) · ${euros(somme())}</div><span>${ico("file-text")} Bordereau prêt à imprimer</span></div>`);
          bravo("<strong>Remise prête.</strong> Et un règlement déposé ne peut plus être modifié par erreur.", suivante, "dépôts d'espèces par billets et pièces, chèques à encaisser plus tard.");
        });
      },
    },
    {
      menu: "Tableau de bord",
      icone: "chart-column",
      moment: "En fin de mois",
      titre: "Vos chiffres, sans tableur.",
      consigne: "Tout ce que vous venez de faire alimente vos chiffres. Ouvrez votre mois.",
      jouer(z) {
        z.insertAdjacentHTML("beforeend", `<button type="button" class="demo-bouton a-cliquer" id="ouvrir">${ico("chart-column")} Voir mon mois</button>`);
        z.querySelector("#ouvrir").focus({ preventScroll: true });
        z.querySelector("#ouvrir").addEventListener("click", (e) => {
          e.currentTarget.remove();
          const barres = [46, 58, 52, 66, 61, 74, 70, 88].map((h, n) => `<i style="--h:${h}%;--n:${n}"></i>`).join("");
          z.insertAdjacentHTML("beforeend", `<div class="demo-kpi"><div class="demo-carte"><small>Chiffre d'affaires</small><strong data-v="8640" data-f="e">0 €</strong></div><div class="demo-carte"><small>Rendez-vous honorés</small><strong data-v="186">0</strong></div><div class="demo-carte"><small>Panier moyen</small><strong data-v="46" data-f="e">0 €</strong></div><div class="demo-carte"><small>Résultat</small><strong data-v="4210" data-f="e">0 €</strong></div></div><div class="demo-carte demo-graphe" aria-hidden="true">${barres}</div><div class="demo-verrous">${VERROUS.map(([t, d]) => `<button type="button" class="demo-verrou" data-verrou="${t}">${ico("lock")}<b>${t}</b><span>${d}</span></button>`).join("")}</div>`);
          z.querySelectorAll("[data-v]").forEach((el) => {
            const euro = el.dataset.f === "e";
            compteur(el, Number(el.dataset.v), (n) => `${Math.round(n).toLocaleString("fr-FR")}${euro ? " €" : ""}`);
          });
          brancherVerrous(z);
          setTimeout(() => bravo("<strong>Un mois entier, en un coup d'œil.</strong> Et ce n'est qu'un aperçu du tableau de bord.", suivante, "charges, rapports, statistiques par motif et par praticien, redevances."), reduit ? 0 : 1100);
        });
      },
    },
    {
      menu: "Votre équipe",
      icone: "users",
      moment: "Et à votre image",
      titre: "Un logiciel qui s'adapte à votre équipe.",
      consigne: "Secrétaire, collaborateurs : chacun a son compte et ses droits. Choisissez qui regarde.",
      jouer(z) {
        const choix = Object.entries(ROLES).map(([id, r]) => `<button type="button" class="demo-role ${id === "titulaire" ? "" : "a-cliquer"}" role="radio" aria-checked="${id === "titulaire"}" data-role="${id}">${r.nom}</button>`).join("");
        const pastilles = THEMES.map(([n, m, v], i) => `<button type="button" class="demo-teinte" role="radio" aria-checked="${i === 0}" aria-label="${n}" title="${n}" data-i="${i}" style="--m:${m};--v:${v}"><i></i></button>`).join("");
        z.insertAdjacentHTML("beforeend", `<div class="demo-roles" role="radiogroup" aria-label="Qui regarde">${choix}</div><div class="demo-deux demo-equipe"><div class="demo-carte demo-droits"><p class="demo-role-phrase" id="phrase" aria-live="polite"></p><ul id="droits"></ul></div><div class="demo-equipe-droite"><div class="demo-carte demo-mini-agenda"><p class="demo-groupe">Son agenda, mardi</p><div id="mini"></div></div><div class="demo-carte demo-theme"><p class="demo-groupe">Essayez : la couleur de votre logiciel</p><div class="demo-teintes" role="radiogroup" aria-label="Couleur">${pastilles}</div></div></div></div><div class="demo-reglages"><span>Et aussi, à votre main :</span>${REGLAGES.map((r) => `<b>${r}</b>`).join("")}</div>`);
        const montrer = (id) => {
          const r = ROLES[id];
          z.querySelector("#phrase").textContent = r.phrase;
          z.querySelector("#droits").innerHTML = r.droits.map(([e, t], i) => `<li class="${e}" style="--n:${i}">${ico(e === "oui" ? "check" : "minus")}<span>${t}</span></li>`).join("");
          const heures = ["09:30", "11:00", "14:15"];
          z.querySelector("#mini").innerHTML = r.agenda.map((n, i) => `<div class="demo-rdv${n === "Occupé" ? " occupe" : ""}" style="--c:${n === "Occupé" ? "var(--bord)" : ["var(--vert)", "var(--ciel)", "var(--rose)"][i]};--n:${i}"><b>${heures[i]}</b>${n}</div>`).join("");
        };
        montrer("titulaire");
        let vu = false;
        z.querySelectorAll(".demo-role").forEach((b) =>
          b.addEventListener("click", () => {
            z.querySelectorAll(".demo-role").forEach((x) => {
              x.setAttribute("aria-checked", String(x === b));
              x.classList.remove("a-cliquer");
            });
            montrer(b.dataset.role);
            if (!vu && b.dataset.role !== "titulaire") {
              vu = true;
              bravo("<strong>Un seul cabinet, un compte pour chacun.</strong> Et vous décidez qui fait quoi, selon votre organisation.", suivante);
            }
          }),
        );
        z.querySelectorAll(".demo-teinte").forEach((b) =>
          b.addEventListener("click", () => {
            z.querySelectorAll(".demo-teinte").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
            const [, m, v] = THEMES[Number(b.dataset.i)];
            const appli = document.querySelector(".demo-appli");
            appli.style.setProperty("--marine", m);
            appli.style.setProperty("--turquoise", v);
          }),
        );
      },
    },
  ];

  // --- Navigation ------------------------------------------------------------------------------------------------------
  let indice = 0;
  const etapesFaites = new Set();

  function majMenu() {
    const liste = $("menu-etapes");
    liste.innerHTML = SCENES.map((s, i) => {
      const ouverte = i === indice || etapesFaites.has(i) || etapesFaites.has(i - 1);
      return `<li class="${etapesFaites.has(i) ? "faite" : ""}" ${i === indice ? 'aria-current="step"' : ""}><button type="button" data-i="${i}" ${ouverte ? "" : "disabled"}>${ico(s.icone)}<span>${s.menu}</span>${etapesFaites.has(i) && i !== indice ? ico("check", "ico-coche") : ""}</button></li>`;
    }).join("");
    $("progression").style.transform = `scaleX(${etapesFaites.size / SCENES.length})`;
  }

  function afficher(i) {
    indice = i;
    majMenu();
    const s = SCENES[i];
    $("scene").innerHTML = `<div class="demo-entre"><p class="demo-moment">${s.moment}</p><h2 tabindex="-1">${s.titre}</h2><p class="demo-consigne">${s.consigne}</p></div>`;
    s.jouer($("scene").firstElementChild);
    const haut = $("demo").getBoundingClientRect().top;
    if (haut < 0 || haut > innerHeight * 0.3) scrollTo({ top: scrollY + haut - 90, behavior: reduit ? "auto" : "smooth" });
    mesurer(`demo_scene_${i + 1}`);
  }

  function suivante() {
    if (indice < SCENES.length - 1) afficher(indice + 1);
    else terminer();
  }

  let minuteur = 0;
  function brancherVerrous(racine) {
    racine.querySelectorAll("[data-verrou]").forEach((b) =>
      b.addEventListener("click", () => {
        const t = $("teaser");
        t.textContent = `${b.dataset.verrou} : dans le logiciel complet.`;
        t.classList.add("visible");
        clearTimeout(minuteur);
        minuteur = setTimeout(() => t.classList.remove("visible"), 2200);
        b.classList.remove("demo-secoue");
        void b.offsetWidth;
        b.classList.add("demo-secoue");
      }),
    );
  }

  function lancer() {
    montrer("demo");
    etapesFaites.clear();
    document.querySelector(".demo-appli").removeAttribute("style");
    $("menu-verrous").innerHTML = VERROUS_MENU.map(([t, i]) => `<li><button type="button" data-verrou="${t}">${ico(i)}<span>${t}</span>${ico("lock", "ico-cadenas")}</button></li>`).join("");
    brancherVerrous($("menu-verrous"));
    afficher(0);
    mesurer("demo_lancee");
  }

  $("menu-etapes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b && !b.disabled) afficher(Number(b.dataset.i));
  });

  // --- Fin -------------------------------------------------------------------------------------------------------------
  const ECLATS = Array.from({ length: 22 }, (_, i) => `<i class="demo-eclat" style="--a:${(i * 360) / 22}deg;--r:${9 + ((i * 7) % 5) * 2}rem;--t:${0.5 + ((i * 3) % 4) * 0.35}rem;--c:${["var(--vert)", "var(--ciel)", "var(--rose)", "var(--turquoise)", "var(--turquoise-doux)"][i % 5]};--d:${0.35 + ((i * 5) % 7) * 0.05}s"></i>`).join("");

  function terminer() {
    montrer("fin");
    const fin = $("fin");
    fin.innerHTML = `<div class="demo-fin-logo" aria-hidden="true">${ECLATS}<span class="demo-fin-rond"><svg><use href="#logo"/></svg></span></div>
      <h2 tabindex="-1">Votre journée est <em>faite.</em></h2>
      <p class="paragraphe"><strong>Et ce n'était qu'un mini-aperçu.</strong> Le vrai PodoLogIQ s'adapte à votre cabinet : comptes pour votre secrétaire et vos collaborateurs, modules, tarifs, documents, stérilisation, stocks, redevances…</p>
      <ul class="demo-bilan">${["Rendez-vous importés", "Compte rendu écrit", "Relevés créés", "Remise préparée", "Chiffres à jour", "Droits de l'équipe"].map((t, n) => `<li style="--n:${n}">${ico("check")}${t}</li>`).join("")}</ul>
      <div class="demo-envie" id="envie"><button type="button" class="bouton bouton-principal a-cliquer" id="je-veux">Je veux PodoLogIQ <span class="rond-fleche" aria-hidden="true">${ico("arrow-right")}</span></button><small>${acces.email ? "En un clic, sans rien ressaisir. Nous vous écrivons à l'adresse que vous avez donnée." : "Nous vous écrivons à l'adresse que vous indiquerez."}</small></div>
      <div class="demo-liens"><button type="button" class="bouton bouton-secondaire bouton-petit" id="rejouer">Rejouer la démo</button><a class="bouton bouton-secondaire bouton-petit" href="index.html">Découvrir le logiciel</a></div>`;
    scrollTo({ top: 0, behavior: reduit ? "auto" : "smooth" });
    fin.querySelector("h2").focus({ preventScroll: true });
    mesurer("demo_terminee");
    fin.querySelector("#rejouer").addEventListener("click", lancer);
    const envie = fin.querySelector("#envie");
    const interesse = () => {
      void envoyer(CONFIG.formulaireInteresses, acces.email);
      mesurer("je_veux_podologiq");
      envie.innerHTML = `<p class="demo-merci" role="status"></p>`;
      envie.firstChild.textContent = `C'est noté ! Nous vous écrivons à ${acces.email}.`;
    };
    fin.querySelector("#je-veux").addEventListener("click", () => {
      if (acces.email) return interesse();
      // Lien ouvert sur un autre appareil : l'adresse n'y est pas connue.
      envie.innerHTML = `<form class="demo-form" novalidate><label class="sr" for="email-fin">Votre adresse e-mail</label><input id="email-fin" type="email" autocomplete="email" placeholder="vous@cabinet.fr" required><button class="bouton bouton-principal" type="submit">Envoyer <span class="rond-fleche" aria-hidden="true">${ico("arrow-right")}</span></button></form>`;
      const champ = envie.querySelector("input");
      champ.focus();
      envie.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        const adresse = champ.value.trim();
        if (!adresseValide(champ)) return e.currentTarget.toggleAttribute("data-invalide", true);
        acces.email = adresse;
        enregistrerAcces();
        interesse();
      });
    });
  }

  // --- Porte d'entrée et validation ------------------------------------------------------------------------------------
  const estLocal = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);
  const pret = Boolean(CONFIG.formulaireEmails && CONFIG.codeConfirmation);
  const AIDE = "Rien reçu après une minute ? Regardez dans vos courriers indésirables.";
  const formulaire = $("form-email");

  function note(texte, erreur = false) {
    $("attente-note").textContent = texte;
    $("attente-note").classList.toggle("erreur", erreur);
  }

  function montrerAttente() {
    montrer("attente");
    $("attente-email").textContent = acces.email;
    $("bloc-local").hidden = pret || !estLocal;
    note(AIDE);
    $("attente-titre").focus({ preventScroll: true });
  }

  /** Bouton de renvoi indisponible 30 s, pour ne pas multiplier les e-mails. */
  function delaiRenvoi() {
    const b = $("renvoyer");
    let reste = 30;
    b.disabled = true;
    b.textContent = `Renvoyer l'e-mail (${reste} s)`;
    clearInterval(delaiRenvoi.minuteur);
    delaiRenvoi.minuteur = setInterval(() => {
      reste -= 1;
      b.textContent = `Renvoyer l'e-mail (${reste} s)`;
      if (reste > 0) return;
      clearInterval(delaiRenvoi.minuteur);
      b.disabled = false;
      b.textContent = "Renvoyer l'e-mail";
    }, 1000);
  }

  async function envoyerLien(texteReussite) {
    delaiRenvoi();
    // En aperçu local, sans service d'e-mails, rien ne part : le bloc d'aperçu le dit.
    if (!pret) return;
    const parti = await envoyer(CONFIG.formulaireEmails, acces.email);
    note(parti ? texteReussite : "L'envoi n'a pas abouti. Vérifiez votre connexion, puis renvoyez l'e-mail.", !parti);
    if (parti) mesurer("demo_email_envoye");
  }

  function erreurPorte(texte) {
    $("erreur-email").textContent = texte;
    $("erreur-email").hidden = false;
    formulaire.toggleAttribute("data-invalide", true);
  }

  formulaire.addEventListener("submit", (e) => {
    e.preventDefault();
    const champ = formulaire.elements.email;
    if (!adresseValide(champ)) {
      erreurPorte("Cette adresse e-mail ne semble pas valide.");
      return champ.focus();
    }
    // En ligne, sans service d'e-mails, personne ne recevrait le lien : on ne promet rien.
    if (!pret && !estLocal) return erreurPorte("La démo ouvre très bientôt. Revenez dans quelques jours.");
    acces = { email: champ.value.trim(), confirme: false };
    enregistrerAcces();
    montrerAttente();
    // Un robot remplit le champ caché : il voit la même page, mais son adresse ne part pas.
    if (!formulaire.elements.site.value) void envoyerLien(AIDE);
    else delaiRenvoi();
  });
  formulaire.elements.email.addEventListener("input", () => {
    $("erreur-email").hidden = true;
    formulaire.removeAttribute("data-invalide");
  });

  $("renvoyer").addEventListener("click", () => void envoyerLien(`E-mail renvoyé à ${acces.email}. ${AIDE}`));
  $("changer").addEventListener("click", () => {
    acces = { email: null, confirme: false };
    enregistrerAcces();
    montrer("porte");
    formulaire.elements.email.focus({ preventScroll: true });
  });
  $("simuler").addEventListener("click", () => {
    acces.confirme = true;
    enregistrerAcces();
    lancer();
  });

  // Lien ouvert dans un autre onglet : celui qui attend s'ouvre aussi.
  addEventListener("storage", (e) => {
    if (e.key !== CLE || $("attente").hidden) return;
    acces = lireAcces();
    if (acces.confirme) lancer();
  });

  // Retour depuis l'e-mail.
  const code = new URLSearchParams(location.search).get("confirme");
  let lienValide = false;
  if (code !== null) {
    history.replaceState(null, "", location.pathname);
    lienValide = Boolean(CONFIG.codeConfirmation) && code === CONFIG.codeConfirmation;
    if (lienValide) {
      acces.confirme = true;
      enregistrerAcces();
      mesurer("demo_email_valide");
    }
  }
  if (acces.confirme) lancer();
  else if (acces.email) montrerAttente();
  else montrer("porte");
  if (code !== null && !lienValide) {
    if (acces.email) note("Ce lien n'est pas valide. Renvoyez-vous l'e-mail ci-dessous.", true);
    else erreurPorte("Ce lien n'est pas valide. Saisissez votre adresse pour en recevoir un nouveau.");
  }
})();

import 'dotenv/config';
import { db } from './db.js';

// Données de départ : reprises telles quelles des anciens fichiers statiques
// du frontend (src/data/products.js, services.js, team.js) pour que la base
// démarre avec le même contenu que le site actuel. Ce script ne s'exécute
// que si les tables sont vides (voir les checks `count === 0` plus bas) :
// il ne réinitialise jamais des données déjà modifiées en base.

// URLs d'images réelles (photos libres de droits, licence CC BY-SA, hébergées
// sur Wikimedia Commons — mêmes principes/licence que les galeries de
// services). Chaque URL a été vérifiée (HTTP 200) avant intégration.
const WIKIMEDIA = (file) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=500`;

// Photos produit fournies directement par l'admin (voir public/products/),
// servies par ce même serveur via express.static (voir server.js).
const LOCAL = (file) => `${process.env.PUBLIC_URL || 'http://localhost:4000'}/products/${file}`;

// Photos d'équipe fournies par l'admin (voir public/team/).
const TEAM_LOCAL = (file) => `${process.env.PUBLIC_URL || 'http://localhost:4000'}/team/${file}`;

// Captures d'écran réelles du site SyCol lui-même (voir public/gallery/),
// utilisées dans la galerie "Développement web & mobile" à la place de
// maquettes génériques.
const GALLERY_LOCAL = (file) => `${process.env.PUBLIC_URL || 'http://localhost:4000'}/gallery/${file}`;

// Chaque URL a été téléchargée et inspectée visuellement (pas seulement vérifiée
// par HTTP 200) avant d'être retenue ici. Beaucoup de photos Wikimedia Commons
// "libres de droits" sont en réalité des photos amateur (cuisines encombrées,
// appareils sales/installés) impropres à un catalogue : ces produits n'ont
// PAS d'imageUrl et affichent à la place une icône sur fond dégradé (voir
// ProductCard dans le frontend) plutôt qu'une mauvaise photo.
const PRODUCTS = [
  // --- Électroménager ---
  { name: 'Réfrigérateur double portes', cat: 'Électroménager', price: '420 000 FCFA', icon: 'Refrigerator', grad: 'bg-sun-grad', description: "Grande capacité, faible consommation d'énergie, garantie 2 ans.", imageUrl: LOCAL('refrigerateur-double-portes.jpg') },
  { name: 'Machine à laver 8kg', cat: 'Électroménager', price: '280 000 FCFA', icon: 'WashingMachine', grad: 'bg-sky-grad', description: 'Plusieurs programmes de lavage, moteur silencieux.', imageUrl: WIKIMEDIA('LGwashingmachine.jpg') },
  { name: 'Climatiseur split 1.5CV', cat: 'Électroménager', price: '310 000 FCFA', icon: 'Fan', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Installation incluse par notre équipe technique.', imageUrl: LOCAL('climatiseur-split-1-5cv.jpg') },
  { name: 'Four électrique multifonction', cat: 'Électroménager', price: '150 000 FCFA', icon: 'Flame', grad: 'bg-gradient-to-br from-red to-orange', description: 'Cuisson homogène, minuterie digitale, 60L.', imageUrl: LOCAL('four-electrique-multifonction.jpg') },
  { name: 'Four à micro-ondes', cat: 'Électroménager', price: '85 000 FCFA', icon: 'Flame', grad: 'bg-gradient-to-br from-blue to-navy', description: 'Décongélation rapide, plusieurs niveaux de puissance, 23L.', imageUrl: LOCAL('four-micro-ondes.jpg') },
  { name: 'Fer à repasser vapeur', cat: 'Électroménager', price: '22 000 FCFA', icon: 'Flame', grad: 'bg-sun-grad', description: 'Semelle anti-adhésive, jet de vapeur puissant, anti-goutte.', imageUrl: WIKIMEDIA('Electric_steam_iron.jpg') },
  { name: 'Ventilateur sur pied', cat: 'Électroménager', price: '35 000 FCFA', icon: 'Fan', grad: 'bg-sky-grad', description: 'Hauteur réglable, oscillation automatique, 3 vitesses.', imageUrl: LOCAL('ventilateur-sur-pied.jpg') },
  { name: 'Cuiseur à riz électrique', cat: 'Électroménager', price: '28 000 FCFA', icon: 'UtensilsCrossed', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Maintien au chaud automatique, cuve amovible antiadhésive.', imageUrl: WIKIMEDIA('Zojirushi_NS-JSS10_with_scoop_20050801.jpg') },
  { name: 'Cafetière électrique', cat: 'Électroménager', price: '32 000 FCFA', icon: 'UtensilsCrossed', grad: 'bg-gradient-to-br from-red to-orange', description: 'Verseuse 1,2L, arrêt automatique, filtre réutilisable.', imageUrl: LOCAL('cafetiere-electrique.jpg') },
  { name: 'Chauffe-eau électrique', cat: 'Électroménager', price: '180 000 FCFA', icon: 'Flame', grad: 'bg-gradient-to-br from-blue to-navy', description: 'Ballon 50L, résistance blindée, installation incluse.', imageUrl: LOCAL('chauffe-eau-electrique.jpg') },

  // --- Accessoires ---
  // Catalogue réel repris du bilan de stock (Bilan.pdf) fourni par l'admin.
  // Le prix affiché est TOUJOURS le "Prix unitaire de revente — P.N." (prix
  // normal de vente au client), jamais le prix d'achat ni le prix plancher
  // "Min" (réservé à la négociation interne, non public).
  { name: 'Airpods', cat: 'Accessoires', price: '4 000 FCFA', icon: 'Headphones', grad: 'bg-sun-grad', description: 'Écouteurs sans fil avec boîtier de charge.', imageUrl: LOCAL('airpods-generique.jpg') },
  { name: 'Écouteurs Bluetooth', cat: 'Accessoires', price: '7 000 FCFA', icon: 'Bluetooth', grad: 'bg-sky-grad', description: 'Connexion sans fil stable, confort d\'écoute au quotidien.', imageUrl: WIKIMEDIA('Wireless_3.0_Earbuds_Transparent_3.png') },
  { name: 'Écouteurs filaires', cat: 'Accessoires', price: '500 FCFA', icon: 'Headphones', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Son clair, connecteur jack universel.', imageUrl: LOCAL('ecouteurs-filaires.jpg') },
  { name: 'Casque JBL (Petit)', cat: 'Accessoires', price: '8 000 FCFA', icon: 'Headphones', grad: 'bg-gradient-to-br from-red to-orange', description: 'Casque audio JBL compact, basses puissantes.', imageUrl: LOCAL('casque-jbl-petit.jpg') },
  { name: 'Casque JBL (Grand)', cat: 'Accessoires', price: '10 000 FCFA', icon: 'Headphones', grad: 'bg-sun-grad', description: 'Casque audio JBL grand format, confort et qualité sonore.', imageUrl: LOCAL('casque-jbl-grand.jpg') },
  { name: 'Casque audio', cat: 'Accessoires', price: '7 000 FCFA', icon: 'Headphones', grad: 'bg-sky-grad', description: 'Casque audio filaire, bonne qualité sonore.', imageUrl: LOCAL('casque-audio.jpg') },
  { name: 'Casque Horo', cat: 'Accessoires', price: '6 000 FCFA', icon: 'Headphones', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Casque audio Horo, léger et confortable.', imageUrl: LOCAL('casque-horo.jpg') },
  { name: 'Tondeuse (Petite)', cat: 'Accessoires', price: '5 000 FCFA', icon: 'Scissors', grad: 'bg-gradient-to-br from-red to-orange', description: 'Tondeuse à cheveux compacte, entretien courant.', imageUrl: LOCAL('tondeuse-petite.jpg') },
  { name: 'Tondeuse (Grande)', cat: 'Accessoires', price: '7 000 FCFA', icon: 'Scissors', grad: 'bg-sun-grad', description: 'Tondeuse professionnelle WAER WA-1950, rechargeable USB, lames longue durée.', imageUrl: LOCAL('tondeuse-grande.jpg') },
  { name: 'Trépied (Long)', cat: 'Accessoires', price: '6 000 FCFA', icon: 'Camera', grad: 'bg-sky-grad', description: 'Trépied extensible pour smartphone, stable et léger.', imageUrl: LOCAL('trepied-long.jpg') },
  { name: 'Trépied rotatif', cat: 'Accessoires', price: '10 000 FCFA', icon: 'Camera', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Trépied rotatif pour smartphone, idéal photos et vidéos.', imageUrl: LOCAL('trepied-rotatif.jpg') },
  { name: 'Micro 2 en 1', cat: 'Accessoires', price: '4 000 FCFA', icon: 'Mic2', grad: 'bg-gradient-to-br from-red to-orange', description: 'Microphone 2 en 1, compatible smartphone et ordinateur.', imageUrl: WIKIMEDIA('Boya_Dual_Omni-Directional_Lavalier_Mic_01.png') },
  { name: 'Micro simple', cat: 'Accessoires', price: '3 500 FCFA', icon: 'Mic', grad: 'bg-sun-grad', description: 'Microphone compact, branchement simple.', imageUrl: LOCAL('micro-simple.jpg') },
  { name: 'Chargeur iPhone (bout normal)', cat: 'Accessoires', price: '5 000 FCFA', icon: 'Cable', grad: 'bg-sky-grad', description: 'Chargeur compatible iPhone, câble et adaptateur secteur.', imageUrl: LOCAL('chargeur-iphone-normal.jpg') },
  { name: 'Chargeur iPhone (bout à fiche)', cat: 'Accessoires', price: '4 000 FCFA', icon: 'Cable', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Chargeur compatible iPhone, embout à fiche.', imageUrl: LOCAL('chargeur-iphone-fiche.jpg') },
  { name: 'Chargeur type C rapide', cat: 'Accessoires', price: '5 000 FCFA', icon: 'Zap', grad: 'bg-gradient-to-br from-red to-orange', description: 'Chargeur USB-C charge rapide.', imageUrl: LOCAL('chargeur-typec-rapide.jpg') },
  { name: 'Chargeur type C rapide (compact)', cat: 'Accessoires', price: '4 000 FCFA', icon: 'Zap', grad: 'bg-sun-grad', description: 'Chargeur USB-C charge rapide, format compact.', imageUrl: LOCAL('chargeur-typec-compact.jpg') },
  { name: 'Cordon multi-embouts', cat: 'Accessoires', price: '1 500 FCFA', icon: 'Cable', grad: 'bg-sky-grad', description: 'Câble universel 3 embouts (iPhone, type C, micro-USB).', imageUrl: LOCAL('cordon-multi-embouts.jpg') },
  { name: 'Cordon Android', cat: 'Accessoires', price: '1 000 FCFA', icon: 'Cable', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Câble de charge et transfert de données pour Android.', imageUrl: LOCAL('cordon-android.jpg') },
  { name: 'Chargeur type C (Fast charger)', cat: 'Accessoires', price: '5 000 FCFA', icon: 'Zap', grad: 'bg-sky-grad', description: 'Chargeur USB-C charge rapide.', imageUrl: LOCAL('chargeur-typec-fastcharger.jpg') },
  { name: 'Power Bank 20000 mAh', cat: 'Accessoires', price: '8 000 FCFA', icon: 'BatteryCharging', grad: 'bg-sun-grad', description: 'Batterie externe grande capacité, charge plusieurs appareils.', imageUrl: LOCAL('power-bank-20000.jpg') },
  { name: 'Power Bank 20000 mAh Oraimo (Original)', cat: 'Accessoires', price: '10 000 FCFA', icon: 'BatteryCharging', grad: 'bg-sky-grad', description: 'Batterie externe Oraimo originale, 20000 mAh.', imageUrl: LOCAL('power-bank-20000-oraimo.jpg') },
  { name: 'Power Bank 30000 mAh (Calus)', cat: 'Accessoires', price: '15 000 FCFA', icon: 'BatteryCharging', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Batterie externe Calus grande capacité, 30000 mAh.', imageUrl: LOCAL('power-bank-30000-calus.jpg') },
  { name: 'Airpods (Original) blancs', cat: 'Accessoires', price: '6 000 FCFA', icon: 'Headphones', grad: 'bg-gradient-to-br from-red to-orange', description: 'Écouteurs sans fil, coloris blanc, qualité premium.', imageUrl: LOCAL('airpods-original-blancs.jpg') },
  { name: 'Airpods Oraimo Noirs', cat: 'Accessoires', price: '6 000 FCFA', icon: 'Headphones', grad: 'bg-sun-grad', description: 'Écouteurs sans fil Oraimo, coloris noir.', imageUrl: LOCAL('airpods-oraimo-noirs.jpg') },
  { name: 'Lampe solaire', cat: 'Accessoires', price: '7 000 FCFA', icon: 'Sun', grad: 'bg-sky-grad', description: 'Lampe rechargeable à énergie solaire, idéale en cas de coupure.', imageUrl: LOCAL('lampe-solaire.jpg') },
  { name: 'Étui Airpods', cat: 'Accessoires', price: '2 500 FCFA', icon: 'Package', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Étui de protection pour boîtier Airpods.', imageUrl: LOCAL('etui-airpods.jpg') },
  { name: 'Chargeur iPhone 16 Pro Max (35W USB-C)', cat: 'Accessoires', price: '15 000 FCFA', icon: 'Zap', grad: 'bg-gradient-to-br from-red to-orange', description: 'Adaptateur secteur Apple 35W USB-C + câble USB-C vers USB-C, pour iPhone 16 Pro Max.', imageUrl: LOCAL('chargeur-iphone16-35w.jpg') },
  { name: 'Chargeur iPhone 14 Pro Max (25W USB-C)', cat: 'Accessoires', price: '12 000 FCFA', icon: 'Zap', grad: 'bg-sky-grad', description: 'Adaptateur secteur Apple 25W USB-C + câble USB-C vers Lightning, pour iPhone 14 Pro Max.', imageUrl: LOCAL('chargeur-iphone14-25w.jpg') },
  { name: 'Adaptateur prise universelle MarKen (20A)', cat: 'Accessoires', price: '2 000 FCFA', icon: 'Plug', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Adaptateur de prise universel multi-normes, 20A.', imageUrl: LOCAL('adaptateur-marken.jpg') },
  { name: 'Chargeur Samsung 45W PD (USB-C)', cat: 'Accessoires', price: '12 000 FCFA', icon: 'Zap', grad: 'bg-sun-grad', description: 'Adaptateur secteur Samsung 45W USB-C Power Delivery + câble USB-C, charge rapide.', imageUrl: LOCAL('chargeur-samsung-45w.jpg') },
  { name: 'Câble de charge rapide 2-en-2 (65W/27W)', cat: 'Accessoires', price: '4 000 FCFA', icon: 'Cable', grad: 'bg-gradient-to-br from-red to-orange', description: 'Câble plat USB-A/Type-C vers Lightning/Type-C, charge rapide 65W/27W.', imageUrl: LOCAL('cable-fast-2en2.jpg') },
  { name: 'Microphone sans fil K9', cat: 'Accessoires', price: '8 000 FCFA', icon: 'Mic2', grad: 'bg-gradient-to-br from-blue to-navy', description: 'Micro-cravate sans fil pour smartphone, idéal live, interviews et vlogs.', imageUrl: LOCAL('micro-k9-sansfil.jpg') },
  { name: 'Écouteurs Oraimo Super Bass', cat: 'Accessoires', price: '9 000 FCFA', icon: 'Headphones', grad: 'bg-sky-grad', description: 'Écouteurs sans fil Oraimo, style intra-auriculaire, son Super Bass.', imageUrl: LOCAL('oraimo-super-bass.jpg') },
  { name: 'Casque tour de cou BT48', cat: 'Accessoires', price: '6 000 FCFA', icon: 'Headphones', grad: 'bg-gradient-to-br from-purple to-blue', description: 'Écouteurs sans fil tour de cou, son Hi-Res Audio, aimant de rangement.', imageUrl: LOCAL('casque-neckband-bt48.jpg') },
  { name: 'Écouteurs sans fil Aroima M43', cat: 'Accessoires', price: '6 000 FCFA', icon: 'Headphones', grad: 'bg-sun-grad', description: 'Écouteurs sans fil tour de cou Aroima, son stéréo, appels mains-libres.', imageUrl: LOCAL('ecouteurs-aroima-m43.jpg') },
  { name: 'Calculatrice', cat: 'Accessoires', price: '1 500 FCFA', icon: 'Calculator', grad: 'bg-gradient-to-br from-red to-orange', description: 'Calculatrice de bureau, écran large, usage quotidien.', imageUrl: WIKIMEDIA('Casio_fx-991ES_Calculator_New.jpg') },
];

const SERVICES = [
  {
    id: 'cctv',
    icon: 'Video',
    grad: 'bg-sky-grad',
    title: 'Caméras de surveillance',
    description: 'Étude des besoins, installation et configuration de systèmes de vidéosurveillance pour particuliers et professionnels.',
    contactLabel: 'Installation de caméras de surveillance',
    points: [
      'Devis & visite technique gratuits',
      'Caméras filaires & sans fil, vision nocturne',
      'Accès à distance via application mobile',
    ],
    gallery: {
      eyebrow: 'Sécurité & vidéosurveillance',
      title: "Exemples d'installations de caméras",
      note: "En attendant nos propres chantiers, voici des photos libres de droits (Wikimedia Commons, licence CC BY-SA) illustrant le type d'installations que nous réalisons.",
      type: 'photo',
      items: [
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/CCTV_Installation.jpg?width=600', caption: 'Installation de caméras — usage domestique et industriel' },
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/IPCorder_NVR_with_cameras.jpg?width=600', caption: 'Enregistreur NVR relié à plusieurs caméras IP' },
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/CCTV_control_room_monitor_wall.jpg?width=600', caption: "Mur d'écrans de supervision vidéo" },
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/CP_Plus_CCTV_camera.jpg?width=600', caption: 'Caméra de vidéosurveillance grand angle' },
      ],
    },
  },
  {
    id: 'dev',
    icon: 'Code2',
    grad: 'bg-gradient-to-br from-purple to-blue',
    title: 'Développement web & mobile',
    description: 'Sites vitrines, e-commerce et applications mobiles sur mesure, pensés pour convertir vos visiteurs en clients.',
    contactLabel: "Développement d'application web ou mobile",
    points: [
      'Sites responsives & performants',
      'Applications Android / iOS',
      'Maintenance & hébergement',
    ],
    gallery: {
      eyebrow: 'Développement web & mobile',
      title: 'Le niveau de qualité que nous livrons',
      note: "Captures d'écran réelles du site SyCol : notre propre site en ligne, notre boutique en ligne et le tableau de bord client — le niveau de qualité que nous livrons.",
      type: 'photo',
      items: [
        { src: GALLERY_LOCAL('site-en-ligne.jpg'), caption: 'Le site SyCol en ligne' },
        { src: GALLERY_LOCAL('boutique-en-ligne.jpg'), caption: 'Notre boutique en ligne (électroménager & accessoires)' },
        { src: GALLERY_LOCAL('tableau-de-bord.jpg'), caption: 'Tableau de bord client (commandes, fidélité)' },
      ],
    },
  },
  {
    id: 'elec',
    icon: 'Zap',
    grad: 'bg-sun-grad',
    title: 'Électricité',
    description: 'Installation, dépannage et mise aux normes électriques pour votre logement ou local professionnel.',
    contactLabel: 'Prestation en électricité',
    points: [
      'Dépannage rapide 7j/7',
      'Mise aux normes & sécurité',
      'Installation de tableaux électriques',
    ],
    gallery: {
      eyebrow: 'Électricité',
      title: 'Exemples de travaux d\'électricité',
      note: 'Photos libres de droits (Wikimedia Commons, licence CC BY-SA) présentées à titre d\'exemple, en attendant les photos de nos propres chantiers.',
      type: 'photo',
      items: [
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Electrician_Mike_Hughes_Installing_Meter_Base.jpg?width=600', caption: "Installation d'un compteur électrique par un électricien" },
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Light_switch_combined_with_Schuko_sockets.JPG?width=600', caption: 'Interrupteur et prises murales' },
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Single-phase_fuse_box_in_Khrushchyovka.JPG?width=600', caption: 'Tableau électrique monophasé' },
        { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Panel_with_diagram.JPG?width=600', caption: 'Tableau de répartition avec schéma' },
      ],
    },
  },
];

// NOTE : Cabrel et Erica n'ont pas encore fourni leur photo — ils réutilisent
// temporairement les photos de Carelle en attendant. À remplacer dès que
// chacun aura sa propre photo. Pareil pour les emails/téléphones/bios des
// membres autres que Carelle : ce sont des valeurs temporaires à remplacer
// par les vraies informations dès qu'elles seront fournies (voir conversation).
const TEAM = [
  {
    name: 'Carelle MASSEMO',
    role: 'Responsable Junior Data Science & IA / Développement',
    initials: 'CM',
    grad: 'bg-sun-grad',
    photoUrl: TEAM_LOCAL('carelle-massemo.jpg'),
    phone: '+330664042690',
    email: 'kotieucarelle@gmail.com',
    bio: "Actuellement étudiante à l'EPSI de Paris, en Master 2 Data Science et Intelligence Artificielle.",
  },
  {
    name: 'Stève SOP',
    role: 'Fondateur & Technicien',
    initials: 'SS',
    grad: 'bg-gradient-to-br from-red to-purple',
    photoUrl: TEAM_LOCAL('steve-sop.jpg'),
    phone: '+237 6XX XXX XXX',
    email: 'steve.sop@sycol.fr',
    bio: 'Description à compléter.',
  },
  {
    name: 'Jenny NYASSI',
    role: 'Installation caméras & électricité',
    initials: 'JN',
    grad: 'bg-gradient-to-br from-purple to-blue',
    photoUrl: TEAM_LOCAL('jenny-nyassi.jpg'),
    phone: '+237 6XX XXX XXX',
    email: 'jenny.nyassi@sycol.fr',
    bio: 'Description à compléter.',
  },
  {
    name: 'Cabrel Djeina',
    role: 'Responsable des Relations client & ventes',
    initials: 'CD',
    grad: 'bg-sky-grad',
    photoUrl: TEAM_LOCAL('jumpsuit.jpg'),
    phone: '+237 6XX XXX XXX',
    email: 'cabrel.djeina@sycol.fr',
    bio: 'Description à compléter.',
  },
  {
    name: 'Erica MANNO',
    role: 'Marketing & communication',
    initials: 'EM',
    grad: 'bg-gradient-to-br from-blue to-navy',
    photoUrl: TEAM_LOCAL('carelle-massemo.jpg'),
    phone: '+237 6XX XXX XXX',
    email: 'erica.manno@sycol.fr',
    bio: 'Description à compléter.',
  },
];

function seedProducts() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  if (count > 0) return;
  const insert = db.prepare(
    'INSERT INTO products (name, cat, price, icon, grad, description, image_url, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  PRODUCTS.forEach((p, i) => insert.run(p.name, p.cat, p.price, p.icon, p.grad, p.description, p.imageUrl, i));
  console.log(`[seed] ${PRODUCTS.length} produits insérés.`);
}

function seedServices() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM services').get();
  if (count > 0) return;

  const insertService = db.prepare(
    'INSERT INTO services (id, icon, grad, title, description, contact_label, position) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertPoint = db.prepare(
    'INSERT INTO service_points (service_id, point, position) VALUES (?, ?, ?)'
  );
  const insertGallery = db.prepare(
    'INSERT INTO galleries (service_id, eyebrow, title, note, type) VALUES (?, ?, ?, ?, ?)'
  );
  const insertGalleryItem = db.prepare(
    'INSERT INTO gallery_items (service_id, src, caption, position) VALUES (?, ?, ?, ?)'
  );

  SERVICES.forEach((s, i) => {
    insertService.run(s.id, s.icon, s.grad, s.title, s.description, s.contactLabel, i);
    s.points.forEach((point, j) => insertPoint.run(s.id, point, j));
    insertGallery.run(s.id, s.gallery.eyebrow, s.gallery.title, s.gallery.note, s.gallery.type);
    s.gallery.items.forEach((item, j) => insertGalleryItem.run(s.id, item.src, item.caption, j));
  });
  console.log(`[seed] ${SERVICES.length} services insérés (avec points & galeries).`);
}

function seedTeam() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM team_members').get();
  if (count > 0) return;
  const insert = db.prepare(
    'INSERT INTO team_members (name, role, initials, grad, photo_url, phone, email, bio, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  TEAM.forEach((m, i) =>
    insert.run(m.name, m.role, m.initials, m.grad, m.photoUrl, m.phone, m.email, m.bio, i)
  );
  console.log(`[seed] ${TEAM.length} membres d'équipe insérés.`);
}

export function seedDatabase() {
  seedProducts();
  seedServices();
  seedTeam();
}

// Permet aussi de lancer `npm run seed` manuellement.
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
  console.log('[seed] Terminé.');
}

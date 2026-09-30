// Protège les routes d'administration (créer/modifier/supprimer des
// produits, services, membres d'équipe, ou lire les messages de contact).
// Le client doit envoyer l'en-tête "x-admin-key" avec la valeur définie
// dans ADMIN_KEY (fichier .env). Sans ADMIN_KEY configuré, ces routes
// restent désactivées pour éviter de les laisser ouvertes par erreur.
export function adminAuth(req, res, next) {
  const configuredKey = process.env.ADMIN_KEY;

  if (!configuredKey) {
    return res.status(501).json({
      error: "Administration désactivée : définissez ADMIN_KEY dans le fichier .env du serveur.",
    });
  }

  const providedKey = req.header('x-admin-key');
  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({ error: 'Clé admin manquante ou invalide.' });
  }

  next();
}

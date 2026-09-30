import nodemailer from 'nodemailer';

// Deux façons d'envoyer des emails, au choix (voir .env.example) :
//   1. RESEND_API_KEY (recommandé) — service dédié resend.com, pas de 2FA
//      ni de "mot de passe d'application" à chercher dans des menus Google.
//   2. SMTP_HOST/SMTP_USER/SMTP_PASS — compte Gmail classique.
// Si Resend est configuré, il est utilisé en priorité. Si aucun des deux
// n'est configuré, l'API continue de fonctionner normalement (les messages
// sont bien enregistrés en base) mais aucun email n'est envoyé — un
// avertissement est juste affiché dans la console.

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

let transporter = null;
function getSmtpTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export function isMailConfigured() {
  return isResendConfigured() || Boolean(getSmtpTransporter());
}

// Envoie un email via Resend (API HTTP simple, pas de SMTP).
async function sendViaResend({ to, replyTo, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Domaine d'expéditeur "bac à sable" de Resend, utilisable sans
      // vérification de domaine. Tant qu'aucun domaine perso n'est vérifié
      // sur resend.com, Resend n'autorise l'envoi qu'à l'adresse email avec
      // laquelle le compte Resend a été créé.
      from: 'SyCol <onboarding@resend.dev>',
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend a refusé l'envoi (${res.status}) : ${body}`);
  }
}

async function sendViaSmtp(t, { to, replyTo, subject, text, html }) {
  await t.sendMail({
    from: `"SyCol" <${process.env.SMTP_USER}>`,
    to,
    replyTo,
    subject,
    text,
    html,
  });
}

async function send(payload) {
  if (isResendConfigured()) {
    await sendViaResend(payload);
    return;
  }
  const t = getSmtpTransporter();
  if (!t) throw new Error('Aucun service email configuré (RESEND_API_KEY ou SMTP_*).');
  await sendViaSmtp(t, payload);
}

// Notifie l'admin (ADMIN_EMAIL, ex: carellemassemo@gmail.com) qu'un client a
// envoyé un message / demandé un devis. Le "Reply-To" est mis sur l'adresse
// du client : il suffit à l'admin de cliquer "Répondre" dans sa messagerie
// pour écrire directement au client, sans copier-coller son adresse.
export async function sendContactNotification({ name, phone, email, message }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!isMailConfigured() || !adminEmail) {
    console.warn('[mailer] Aucun service email ou ADMIN_EMAIL non configuré : notification non envoyée.');
    return { sent: false };
  }

  await send({
    to: adminEmail,
    replyTo: email,
    subject: `📩 Nouveau message client — ${name}`,
    text: [
      `Nouveau message reçu sur le site SyCol.`,
      ``,
      `Nom : ${name}`,
      `Téléphone : ${phone}`,
      `Email : ${email}`,
      ``,
      `Message :`,
      message,
      ``,
      `— Pour répondre au client, répondez directement à cet email (Répondre / Reply).`,
    ].join('\n'),
    html: `
      <h2>Nouveau message reçu sur le site SyCol</h2>
      <p><strong>Nom :</strong> ${escapeHtml(name)}<br/>
         <strong>Téléphone :</strong> ${escapeHtml(phone)}<br/>
         <strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Message :</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      <p style="color:#888;font-size:.85em">Pour répondre au client, cliquez sur "Répondre" dans votre messagerie : l'email partira directement à ${escapeHtml(email)}.</p>
    `,
  });

  return { sent: true };
}

const PAYMENT_LABELS = {
  orange_money: 'Orange Money',
  mtn_money: 'MTN Mobile Money',
  paypal: 'PayPal',
  card: 'Carte bancaire',
  cash: 'Espèces à la livraison',
};

// Notifie l'admin qu'un client connecté vient de passer une commande depuis
// son panier (voir routes/orders.js). Le paiement n'étant pas encore branché
// sur un vrai prestataire, l'admin doit vérifier manuellement la réception
// du règlement avant de confirmer la commande.
export async function sendOrderNotification({ order, user }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!isMailConfigured() || !adminEmail) {
    console.warn('[mailer] Aucun service email ou ADMIN_EMAIL non configuré : notification commande non envoyée.');
    return { sent: false };
  }

  const lines = order.items.map((i) => `  - ${i.name} x${i.qty} = ${i.price}`);
  const paymentLabel = PAYMENT_LABELS[order.payment_method] || order.payment_method;

  await send({
    to: adminEmail,
    replyTo: user.email,
    subject: `🛒 Nouvelle commande #${order.id} — ${user.name}`,
    text: [
      `Nouvelle commande passée sur le site SyCol.`,
      ``,
      `Client : ${user.name} (${user.phone} / ${user.email})`,
      `Moyen de paiement choisi : ${paymentLabel}`,
      order.promo_code ? `Code promo utilisé : ${order.promo_code} (-${order.discount} FCFA)` : null,
      ``,
      `Articles :`,
      ...lines,
      ``,
      `Total : ${order.total} FCFA`,
      ``,
      `— Vérifiez la réception du paiement puis confirmez la commande (statut) côté admin.`,
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
      <h2>Nouvelle commande #${order.id} — SyCol</h2>
      <p><strong>Client :</strong> ${escapeHtml(user.name)} (${escapeHtml(user.phone)} / ${escapeHtml(user.email)})<br/>
         <strong>Paiement :</strong> ${escapeHtml(paymentLabel)}</p>
      <ul>${order.items.map((i) => `<li>${escapeHtml(i.name)} x${i.qty} = ${escapeHtml(i.price)}</li>`).join('')}</ul>
      <p><strong>Total : ${order.total} FCFA</strong></p>
      <p style="color:#888;font-size:.85em">Vérifiez la réception du paiement (${escapeHtml(paymentLabel)}) avant de confirmer la commande.</p>
    `,
  });

  return { sent: true };
}

// Envoie la réponse de l'admin directement au client (utilisé par la route
// admin POST /api/contact/:id/reply). Alternative à la réponse via Gmail.
// NOTE : avec Resend en mode bac à sable (sans domaine vérifié), cet envoi
// échouera si toEmail n'est pas l'adresse du compte Resend — voir README.
export async function sendReplyToClient({ toEmail, clientName, replyMessage }) {
  if (!isMailConfigured()) throw new Error('Aucun service email configuré côté serveur.');

  await send({
    to: toEmail,
    replyTo: process.env.ADMIN_EMAIL,
    subject: 'Réponse à votre demande — SyCol',
    text: `Bonjour ${clientName},\n\n${replyMessage}\n\n— L'équipe SyCol`,
    html: `<p>Bonjour ${escapeHtml(clientName)},</p><p>${escapeHtml(replyMessage).replace(/\n/g, '<br/>')}</p><p>— L'équipe SyCol</p>`,
  });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

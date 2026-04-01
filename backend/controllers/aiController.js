const { OpenAI } = require('openai');
const db = require('../config/db');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-to-prevent-crash-on-boot',
});

exports.getBankAdvice = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Le message est requis.' });
        }

        const [users] = await db.query('SELECT prenom, nom, email, date_naissance, adresse_postale, telephone FROM utilisateurs WHERE id = ?', [userId]);
        const user = users[0];

        const [accounts] = await db.query('SELECT numero_compte, type_compte, solde FROM comptes_bancaires WHERE utilisateur_id = ?', [userId]);

        let contextAccounts = accounts.map(acc => `- Compte ${acc.type_compte} (${acc.numero_compte}): ${parseFloat(acc.solde).toLocaleString('fr-FR')} EUR`).join('\n');
        if (accounts.length === 0) contextAccounts = "Le client n'a aucun compte actif.";

        const [transactions] = await db.query(
            `SELECT montant, type_transaction, libelle, date_transaction 
             FROM transactions 
             WHERE compte_source_id IN (SELECT id FROM comptes_bancaires WHERE utilisateur_id = ?) 
                OR compte_destinataire_id IN (SELECT id FROM comptes_bancaires WHERE utilisateur_id = ?) 
             ORDER BY date_transaction DESC 
             LIMIT 15`, [userId, userId]);

        let contextTransactions = transactions.map(t => `- ${new Date(t.date_transaction).toLocaleDateString('fr-FR')} : ${t.type_transaction} de ${parseFloat(t.montant).toLocaleString('fr-FR')} EUR (${t.libelle || 'Sans libellé'})`).join('\n');
        if (transactions.length === 0) contextTransactions = "Aucune transaction récente.";

        const systemPrompt = `Tu es l'assistant IA officiel, professionnel et courtois de la banque française 'IrisBank'. 
Tu parles toujours en français. Tu t'adresses au client de manière respectueuse.
IMPORTANT: Tes réponses doivent être TRES COURTES et concises (2 ou 3 phrases grand maximum). Va droit au but. N'utilise pas de longues formules de politesse à rallonge.

Voici les informations de ton client :
Nom: M./Mme ${user.nom || ''} ${user.prenom || 'Client'}

Ses comptes actuels :
${contextAccounts}

Ses 15 dernières transactions/dépenses :
${contextTransactions}

Ton but est de l'aider à gérer ses finances ou répondre à ses questions. N'invente JAMAIS d'autres transactions que celles fournies. Refuse poliment de répondre à des sujets hors banque.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        res.status(200).json({ reply: response.choices[0].message.content });

    } catch (error) {
        console.error('Erreur OpenAI/AI Controller:', error);
        res.status(500).json({ message: 'L\'assistant virtuel est momentanément indisponible.', error: error.message });
    }
};

const { OpenAI } = require('openai');
const db = require('../config/db');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.getBankAdvice = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Le message est requis.' });
        }

        // Fetch User and their accounts to provide context to the AI
        const [users] = await db.query('SELECT prenom, nom, email, date_naissance, adresse_postale, telephone FROM utilisateurs WHERE id = ?', [userId]);
        const user = users[0];

        const [accounts] = await db.query('SELECT numero_compte, type_compte, solde, devise FROM comptes_bancaires WHERE utilisateur_id = ?', [userId]);

        let contextAccounts = accounts.map(acc => `- Compte ${acc.type_compte} (${acc.numero_compte}): ${parseFloat(acc.solde).toLocaleString('fr-FR')} ${acc.devise || 'EUR'}`).join('\n');
        if (accounts.length === 0) contextAccounts = "Le client n'a aucun compte actif.";

        const systemPrompt = `Tu es l'assistant IA officiel, professionnel et courtois de la banque française 'IrisBank'. 
Tu parles toujours en français. Tu t'adresses au client par son prénom ou nom de manière respectueuse (ex: Bonjour M./Mme X).
Voici les informations du client que tu assistes :
Prénom: ${user.prenom || 'Client'}
Nom: ${user.nom || 'IrisBank'}
Email: ${user.email}
Téléphone: ${user.telephone || 'Non renseigné'}
Adresse: ${user.adresse_postale || 'Non renseignée'}

Voici la liste de ses comptes actuels:
${contextAccounts}

Ton but est de l'aider à gérer ses finances, de le conseiller sur son épargne, ou de répondre à ses questions sur ses comptes. 
Garde tes réponses, précises, structurées et chaleureuses. Tu ne dois JAMAIS inventer de soldes différents de ceux fournis. 
Si on te pose des questions hors du domaine bancaire, rappelle poliment que tu es un conseiller bancaire IrisBank.`;

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

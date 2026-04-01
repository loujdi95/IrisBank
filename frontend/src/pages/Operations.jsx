import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Grid, Select, MenuItem, FormControl, InputLabel, Avatar, Container } from '@mui/material';
import { History, AccountBalanceWallet, DirectionsCar, Restaurant, LocalMall, SportsSoccer, Payments, MedicalServices, HelpOutline } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

// Composant icône avec sécurité
const CategoryIcon = ({ description }) => {
    const desc = (description || "").toLowerCase();
    if (desc.includes('uber') || desc.includes('transport') || desc.includes('train')) return <DirectionsCar />;
    if (desc.includes('restaurant') || desc.includes('eats') || desc.includes('food') || desc.includes('carrefour') || desc.includes('lidl')) return <Restaurant />;
    if (desc.includes('sport') || desc.includes('decathlon') || desc.includes('foot')) return <SportsSoccer />;
    if (desc.includes('mall') || desc.includes('shopping') || desc.includes('boutique')) return <LocalMall />;
    if (desc.includes('sante') || desc.includes('doctolib') || desc.includes('pharmacie')) return <MedicalServices />;
    return <Payments />;
};

// Formatage monétaire sécurisé
const FormatCurrency = ({ amount }) => {
    const val = parseFloat(amount) || 0;
    try {
        const formatted = Math.abs(val).toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        });
        return (
            <Typography className="text-pro-amount">
                {val < 0 ? '-' : '+'} {formatted}
            </Typography>
        );
    } catch (e) {
        return <Typography className="text-pro-amount">0,00 €</Typography>;
    }
};

export default function Operations() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const accRes = await axios.get(`${API_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } });
            const accData = Array.isArray(accRes.data) ? accRes.data : [];
            setAccounts(accData);
            
            // Récupération sécurisée des transactions par compte
            const allTransactions = [];
            for (const acc of accData) {
                try {
                    const txRes = await axios.get(`${API_URL}/transactions/${acc.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (Array.isArray(txRes.data)) {
                        const mapped = txRes.data.map(tx => ({
                            ...tx,
                            accountType: acc.type_compte,
                            accountNumber: acc.numero_compte
                        }));
                        allTransactions.push(...mapped);
                    }
                } catch (e) {
                    console.error(`Erreur pour le compte ${acc.id}`);
                }
            }
            
            // Tri final
            allTransactions.sort((a, b) => new Date(b.date_transaction) - new Date(a.date_transaction));
            setTransactions(allTransactions);
            setLoading(false);
        } catch (error) {
            console.error("Erreur globale fetchData", error);
            toast.error("Impossible de charger les opérations.");
            setLoading(false);
        }
    };

    const selectedAccount = useMemo(() => {
        if (selectedAccountId === 'all') return null;
        return accounts.find(a => a.id.toString() === selectedAccountId.toString());
    }, [selectedAccountId, accounts]);

    const groupedTransactions = useMemo(() => {
        const filtered = selectedAccountId === 'all' 
            ? transactions 
            : transactions.filter(tx => tx.compte_id.toString() === selectedAccountId.toString());

        const groups = {};
        filtered.forEach(tx => {
            const d = new Date(tx.date_transaction);
            const dateStr = isNaN(d.getTime()) ? "Date inconnue" : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(tx);
        });
        return groups;
    }, [transactions, selectedAccountId]);

    return (
        <Container maxWidth="md" sx={{ pb: 8 }}>
            <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--iris-text)', mb: 1 }}>Historique</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--iris-text-light)', fontWeight: 500 }}>
                        {selectedAccountId === 'all' ? 'Toutes vos opérations consolidées.' : `Compte ${selectedAccount?.numero_compte || ''}`}
                    </Typography>
                </Box>

                <FormControl sx={{ minWidth: 260 }}>
                    <InputLabel>Filtrer par compte</InputLabel>
                    <Select
                        value={selectedAccountId}
                        label="Filtrer par compte"
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        sx={{ borderRadius: '12px', bgcolor: 'white' }}
                    >
                        <MenuItem value="all">Tous les comptes</MenuItem>
                        {accounts.map((acc) => (
                            <MenuItem key={acc.id} value={acc.id}>{acc.type_compte.toUpperCase()} - {acc.numero_compte}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedAccount && (
                <Box className="balance-focus-box">
                    <Typography sx={{ fontSize: '0.9rem', color: 'var(--iris-blue)', fontWeight: 700, mb: 1 }}>Solde actuel</Typography>
                    <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--iris-text)' }}>
                        {parseFloat(selectedAccount.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                </Box>
            )}

            {loading ? (
                <Typography textAlign="center" py={10}>Chargement...</Typography>
            ) : Object.keys(groupedTransactions).length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                    <History sx={{ fontSize: '4rem', color: '#F1F5F9', mb: 3 }} />
                    <Typography color="var(--iris-text-light)">Aucune opération trouvée.</Typography>
                </Box>
            ) : (
                Object.entries(groupedTransactions).map(([date, ops]) => (
                    <Box key={date}>
                        <Typography className="date-header">{date}</Typography>
                        <Box className="minimal-group-card">
                            {ops.map((op, idx) => (
                                <Box key={idx} className="op-row">
                                    <Box className="monochrome-icon-box" sx={{ mr: 2.5 }}>
                                        <CategoryIcon description={op.description} />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography className="text-pro-main">{op.description || "Opération sans libellé"}</Typography>
                                        <Typography className="text-pro-sub">
                                            {selectedAccountId === 'all' ? `${op.accountType?.toUpperCase()} • ${op.accountNumber}` : 'Virement bancaire'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <FormatCurrency amount={op.montant} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))
            )}
        </Container>
    );
}

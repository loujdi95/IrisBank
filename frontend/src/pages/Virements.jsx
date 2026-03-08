import { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, TextField, Button, MenuItem, InputAdornment, Divider } from '@mui/material';
import { Send, AccountBalanceWallet, SwapHoriz } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Virements() {
    const [accounts, setAccounts] = useState([]);
    const [sourceId, setSourceId] = useState('');
    const [destIban, setDestIban] = useState('');
    const [montant, setMontant] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [selectedBen, setSelectedBen] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } });
            setAccounts(res.data);
            if (res.data.length > 0) setSourceId(res.data[0].id);

            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                const storedBen = localStorage.getItem(`beneficiaries_${storedUser.id}`);
                if (storedBen) setBeneficiaries(JSON.parse(storedBen));
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la récupération des comptes");
        }
    };

    useEffect(() => {
        if (sourceId) {
            fetchTransactions(sourceId);
        }
    }, [sourceId]);

    const fetchTransactions = async (accountId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/transactions/${accountId}`, { headers: { Authorization: `Bearer ${token}` } });
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/transactions/transfer`, {
                sourceId,
                destIban,
                montant: parseFloat(montant),
                description
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success("Virement effectué avec succès");
            setDestIban('');
            setSelectedBen('');
            setMontant('');
            setDescription('');
            fetchAccounts(); // Refresh balances
            fetchTransactions(sourceId); // Refresh history
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors du virement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ textTransform: 'uppercase', color: '#333', mb: 0.5, fontSize: '1.4rem', fontWeight: 400 }}>
                    Opérations et Virements
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Saisir un Virement
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 4 }}>
                            <form onSubmit={handleTransfer}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <AccountBalanceWallet sx={{ color: '#002B5E', mr: 1 }} />
                                            <Typography variant="subtitle1" sx={{ color: '#002B5E', fontWeight: 'bold' }}>1. Compte à débiter</Typography>
                                        </Box>
                                        <TextField
                                            select
                                            fullWidth
                                            size="medium"
                                            value={sourceId}
                                            onChange={(e) => setSourceId(e.target.value)}
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: '#F9F9F9' } }}
                                        >
                                            {accounts.map((account) => (
                                                <MenuItem key={account.id} value={account.id} sx={{ py: 1.5 }}>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 'bold' }}>{account.type_compte.toUpperCase()}</Typography>
                                                        <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>{account.numero_compte} - Solde: {parseFloat(account.solde).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR</Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                            {accounts.length === 0 && <MenuItem disabled>Aucun compte disponible</MenuItem>}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: -1 }}>
                                        <SwapHoriz sx={{ transform: 'rotate(90deg)', color: '#CCC', fontSize: '2rem' }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Send sx={{ color: '#002B5E', mr: 1, fontSize: '1.2rem' }} />
                                            <Typography variant="subtitle1" sx={{ color: '#002B5E', fontWeight: 'bold' }}>2. Compte à créditer</Typography>
                                        </Box>

                                        {beneficiaries.length > 0 && (
                                            <TextField
                                                select
                                                fullWidth
                                                size="medium"
                                                label="Choisir un bénéficiaire enregistré (optionnel)"
                                                value={selectedBen}
                                                onChange={(e) => {
                                                    setSelectedBen(e.target.value);
                                                    if (e.target.value) setDestIban(e.target.value);
                                                }}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 }, mb: 2 }}
                                            >
                                                <MenuItem value="">Saisir un nouvel IBAN manuellement</MenuItem>
                                                {beneficiaries.map((ben, idx) => (
                                                    <MenuItem key={idx} value={ben.iban}>
                                                        {ben.nom} ({ben.iban})
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}

                                        <TextField
                                            fullWidth
                                            size="medium"
                                            label="IBAN ou Nom du bénéficiaire"
                                            placeholder="Ex: FR76..."
                                            value={destIban}
                                            onChange={(e) => {
                                                setDestIban(e.target.value);
                                                setSelectedBen('');
                                            }}
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Divider />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" sx={{ color: '#002B5E', fontWeight: 'bold', mb: 2 }}>3. Détails du virement</Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            size="medium"
                                            label="Montant"
                                            type="number"
                                            placeholder="0.00"
                                            inputProps={{ min: 0, step: "0.01" }}
                                            value={montant}
                                            onChange={(e) => setMontant(e.target.value)}
                                            required
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">EUR</InputAdornment>
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            size="medium"
                                            label="Motif (optionnel)"
                                            placeholder="Ex: Loyer"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sx={{ mt: 3, pt: 2, borderTop: '1px solid #E5E5E5', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            sx={{ color: '#002B5E', borderColor: '#002B5E', borderRadius: 20, px: 4, textTransform: 'none', fontWeight: 'bold' }}
                                            onClick={() => {
                                                setDestIban('');
                                                setMontant('');
                                                setDescription('');
                                            }}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading || accounts.length === 0}
                                            sx={{
                                                bgcolor: '#E4002B',
                                                color: 'white',
                                                borderRadius: 20,
                                                px: 4,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 'bold',
                                                boxShadow: 'none',
                                                '&:hover': { bgcolor: '#B30022', boxShadow: 'none' }
                                            }}
                                        >
                                            {loading ? 'Traitement...' : 'Valider le virement'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Box>
                    </Paper>
                </Grid>

                {/* RHS Column: Historique des Opérations */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Historique des Opérations
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 3, maxHeight: '420px', overflowY: 'auto' }}>
                            {transactions.length === 0 ? (
                                <Typography sx={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', py: 4 }}>Aucune opération récente sélectionnée.</Typography>
                            ) : (
                                transactions.map((tx, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F0F0', py: 1.5 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.75rem', color: '#888', mb: 0.2 }}>
                                                {new Date(tx.date_transaction).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.9rem', color: '#333', fontWeight: 500 }}>
                                                {tx.libelle || tx.description}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', color: parseFloat(tx.montant) < 0 ? '#333' : '#008033' }}>
                                            {parseFloat(tx.montant) > 0 ? '+' : ''}{parseFloat(tx.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent', mt: 4 }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Informations
                            </Typography>
                        </Box>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 3 }}>
                            <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 2 }}>
                                Les virements SEPA classiques vers d'autres banques sont exécutés sous 1 à 2 jours ouvrés.
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                Pour les virements instantanés, la somme est disponible en 10 secondes sur le compte du bénéficiaire.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

import { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, TextField, Button, MenuItem, InputAdornment, Divider, Stepper, Step, StepLabel, StepConnector, Avatar, IconButton } from '@mui/material';
import { Send, AccountBalanceWallet, SwapHoriz, ArrowForward, ArrowBack, CheckCircle, Search, Add } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.MuiStepConnector-root`]: {
        marginLeft: 16,
    },
    [`& .MuiStepConnector-line`]: {
        borderColor: '#E2E8F0',
        borderLeftWidth: 2,
        minHeight: 30,
    },
}));

const FormatCurrency = ({ amount }) => {
    const isNegative = amount < 0;
    const formatted = Math.abs(amount).toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    });
    return (
        <Typography sx={{ 
            fontWeight: 800, 
            color: isNegative ? '#EF4444' : '#22C55E',
            fontSize: '1rem'
        }}>
            {isNegative ? '-' : '+'} {formatted}
        </Typography>
    );
};

export default function Virements() {
    const [activeStep, setActiveStep] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const [sourceId, setSourceId] = useState('');
    const [destIban, setDestIban] = useState('');
    const [montant, setMontant] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const steps = ['Débit', 'Bénéficiaire', 'Montant'];

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
            toast.error("Erreur de récupération");
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

    const handleTransfer = async () => {
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
            setActiveStep(0);
            setDestIban('');
            setMontant('');
            setDescription('');
            fetchAccounts();
            fetchTransactions(sourceId);
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors du virement");
        } finally {
            setLoading(false);
        }
    };

    const selectedSource = accounts.find(a => a.id === sourceId);

    return (
        <Box sx={{ pb: 8 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" sx={{ color: 'var(--iris-blue)', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                    Effectuer un virement
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--iris-text-light)', fontWeight: 500 }}>
                    Transférez des fonds en toute sécurité vers vos comptes ou vos bénéficiaires.
                </Typography>
            </Box>

            <Grid container spacing={5} justifyContent="center">
                {/* Main Stepper Column */}
                <Grid item xs={12} lg={8}>
                    <Paper elevation={0} className="premium-card" sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                            {/* Desktop Stepper */}
                            <Box sx={{ bgcolor: '#F8FAFC', p: 4, width: { xs: '100%', md: '220px' }, borderRight: '1px solid var(--iris-border)', borderBottom: { xs: '1px solid var(--iris-border)', md: 'none' } }}>
                                <Stepper activeStep={activeStep} orientation="vertical" connector={<QontoConnector />}>
                                    {steps.map((label, index) => (
                                        <Step key={label}>
                                            <StepLabel StepIconProps={{ sx: { fontSize: '1.5rem' } }}>
                                                <Typography sx={{ fontWeight: activeStep === index ? 800 : 500, fontSize: '0.85rem', color: activeStep === index ? 'var(--iris-blue)' : 'var(--iris-text-light)' }}>
                                                    {label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>

                            {/* Content Area */}
                            <Box sx={{ p: { xs: 3, md: 5 }, flexGrow: 1 }}>
                                {activeStep === 0 && (
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, mb: 3 }}>Choisir le compte à débiter</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {accounts.map((acc) => (
                                                <Box 
                                                    key={acc.id}
                                                    onClick={() => setSourceId(acc.id)}
                                                    sx={{ 
                                                        p: 2.5, 
                                                        borderRadius: '16px', 
                                                        border: '2px solid', 
                                                        borderColor: sourceId === acc.id ? 'var(--iris-blue)' : 'var(--iris-border)',
                                                        bgcolor: sourceId === acc.id ? 'var(--iris-blue-light)' : 'white',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: sourceId === acc.id ? 'var(--iris-blue)' : '#E2E8F0', width: 40, height: 40 }}>
                                                            <AccountBalanceWallet sx={{ fontSize: '1.2rem' }} />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--iris-text)' }}>
                                                                {acc.type_compte === 'courant' ? 'Eurocompte Jeune' : 'Livret Bleu'}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--iris-text-light)', fontFamily: 'monospace' }}>
                                                                {acc.numero_compte}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <FormatCurrency amount={acc.solde} />
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {activeStep === 1 && (
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, mb: 3 }}>Sélectionner le bénéficiaire</Typography>
                                        
                                        {/* My Accounts Section for Internal Transfers */}
                                        <Box sx={{ mb: 4 }}>
                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--iris-text-light)', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
                                                Mes comptes
                                            </Typography>
                                            <Box className="minimal-group-card">
                                                {accounts.filter(acc => acc.id !== sourceId).map((acc, idx) => (
                                                    <Box 
                                                        key={acc.id}
                                                        onClick={() => setDestIban(acc.numero_compte)}
                                                        className="op-row"
                                                        sx={{ 
                                                            bgcolor: destIban === acc.numero_compte ? '#F0F7FF' : 'transparent',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Box className="monochrome-icon-box" sx={{ mr: 2, bgcolor: destIban === acc.numero_compte ? '#DEE9FF' : '#F8FAFC' }}>
                                                            <AccountBalanceWallet sx={{ fontSize: '1.2rem' }} />
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography className="text-pro-main">
                                                                {acc.type_compte === 'courant' ? 'Eurocompte Jeune' : 'Livret Bleu'}
                                                            </Typography>
                                                            <Typography className="text-pro-sub">{acc.numero_compte}</Typography>
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--iris-text)' }}>
                                                                {parseFloat(acc.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>

                                        <Box sx={{ mb: 4 }}>
                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--iris-text-light)', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
                                                Virement externe
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                label="Saisir un IBAN"
                                                placeholder="FR76..."
                                                value={destIban}
                                                onChange={(e) => setDestIban(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                                }}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' } }}
                                            />
                                        </Box>

                                        {beneficiaries.length > 0 && (
                                            <Box sx={{ mb: 1 }}>
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--iris-text-light)', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
                                                    Bénéficiaires enregistrés
                                                </Typography>
                                                <Box className="minimal-group-card">
                                                    {beneficiaries.map((ben, idx) => (
                                                        <Box 
                                                            key={idx}
                                                            onClick={() => setDestIban(ben.iban)}
                                                            className="op-row"
                                                            sx={{ 
                                                                bgcolor: destIban === ben.iban ? '#F0F7FF' : 'transparent',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography className="text-pro-main">{ben.nom}</Typography>
                                                                <Typography className="text-pro-sub">{ben.iban}</Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {activeStep === 2 && (
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, mb: 3 }}>Montant et Détails</Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Montant du transfert"
                                                    type="number"
                                                    value={montant}
                                                    onChange={(e) => setMontant(e.target.value)}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">EUR</InputAdornment>,
                                                        sx: { fontSize: '1.5rem', fontWeight: 800, p: 1 }
                                                    }}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F8FAFC' } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Libellé du virement"
                                                    placeholder="Loyer, Remboursement, etc."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}

                                {/* Navigation Buttons */}
                                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid var(--iris-border)', display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        onClick={() => setActiveStep(prev => prev - 1)}
                                        disabled={activeStep === 0}
                                        startIcon={<ArrowBack />}
                                        sx={{ textTransform: 'none', fontWeight: 700, color: 'var(--iris-text-light)' }}
                                    >
                                        Retour
                                    </Button>
                                    
                                    {activeStep < 2 ? (
                                        <Button
                                            variant="contained"
                                            onClick={() => setActiveStep(prev => prev + 1)}
                                            disabled={activeStep === 0 ? !sourceId : !destIban}
                                            endIcon={<ArrowForward />}
                                            sx={{ bgcolor: 'var(--iris-blue)', px: 4, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                                        >
                                            Suivant
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={handleTransfer}
                                            disabled={loading || !montant}
                                            startIcon={loading ? null : <CheckCircle />}
                                            sx={{ bgcolor: 'var(--iris-blue-dark)', px: 4, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                                        >
                                            {loading ? 'Traitement...' : 'Confirmer le virement'}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

        </Box>
    );
}

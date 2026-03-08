import { useState } from 'react';
import { Box, Typography, Container, Paper, Grid, TextField, Button, MenuItem, InputAdornment, Divider } from '@mui/material';
import { Calculate } from '@mui/icons-material';

export default function Simulations() {
    const [amount, setAmount] = useState('10000');
    const [duration, setDuration] = useState('48');
    const [rate, setRate] = useState('4.9');
    const [monthlyPayment, setMonthlyPayment] = useState(null);
    const [totalCost, setTotalCost] = useState(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        const principal = parseFloat(amount);
        const calculatedInterest = parseFloat(rate) / 100 / 12;
        const calculatedPayments = parseFloat(duration);

        if (principal > 0 && calculatedInterest > 0 && calculatedPayments > 0) {
            const x = Math.pow(1 + calculatedInterest, calculatedPayments);
            const monthly = (principal * x * calculatedInterest) / (x - 1);

            if (isFinite(monthly)) {
                setMonthlyPayment(monthly);
                setTotalCost((monthly * calculatedPayments) - principal);
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ textTransform: 'uppercase', color: '#333', mb: 0.5, fontSize: '1.4rem', fontWeight: 400 }}>
                    Simulations
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Simulateur de Prêt Personnel
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 4 }}>
                            <form onSubmit={handleCalculate}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ color: '#333', mb: 1, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>Montant du projet</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            type="number"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">EUR</InputAdornment>,
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" sx={{ color: '#333', mb: 1, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>Durée de remboursement</Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                                        >
                                            <MenuItem value="12">12 mois (1 an)</MenuItem>
                                            <MenuItem value="24">24 mois (2 ans)</MenuItem>
                                            <MenuItem value="36">36 mois (3 ans)</MenuItem>
                                            <MenuItem value="48">48 mois (4 ans)</MenuItem>
                                            <MenuItem value="60">60 mois (5 ans)</MenuItem>
                                            <MenuItem value="72">72 mois (6 ans)</MenuItem>
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" sx={{ color: '#333', mb: 1, fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>TAEG Fixe (%)</Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={rate}
                                            onChange={(e) => setRate(e.target.value)}
                                            required
                                            type="number"
                                            inputProps={{ step: "0.1" }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sx={{ mt: 2, textAlign: 'right' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<Calculate />}
                                            sx={{
                                                bgcolor: '#002B5E',
                                                py: 1,
                                                px: 4,
                                                fontWeight: 'bold',
                                                borderRadius: 0,
                                                '&:hover': { bgcolor: '#001D40' }
                                            }}
                                        >
                                            Calculer
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent', height: '100%' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Résultat de la simulation
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 4, height: 'calc(100% - 53px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {monthlyPayment ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ color: '#333', mb: 1 }}>Mensualité estimée :</Typography>
                                    <Typography variant="h3" sx={{ color: '#002B5E', fontWeight: 'bold', mb: 3 }}>
                                        {monthlyPayment.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </Typography>

                                    <Divider sx={{ mb: 3 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ color: '#666' }}>Montant emprunté :</Typography>
                                        <Typography sx={{ fontWeight: 'bold' }}>{parseFloat(amount).toLocaleString('fr-FR')} €</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ color: '#666' }}>Durée :</Typography>
                                        <Typography sx={{ fontWeight: 'bold' }}>{duration} mois</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography sx={{ color: '#666' }}>Coût total du crédit :</Typography>
                                        <Typography sx={{ fontWeight: 'bold', color: '#cc0000' }}>{totalCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: '#666' }}>Montant total dû :</Typography>
                                        <Typography sx={{ fontWeight: 'bold' }}>{(parseFloat(amount) + totalCost).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography sx={{ color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
                                    Remplissez le formulaire à gauche pour estimer votre mensualité. Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

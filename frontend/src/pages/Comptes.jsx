import { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem } from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Comptes() {
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [newAccountType, setNewAccountType] = useState('courant');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } });
            setAccounts(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la récupération des comptes");
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/accounts`, { type_compte: newAccountType, type_carte: null }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Nouveau compte ouvert avec succès");
            setOpenModal(false);
            fetchAccounts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur ouverture compte");
        }
    };

    const FormatCurrency = ({ amount }) => {
        const num = parseFloat(amount);
        const formatString = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(num));

        const color = num < 0 ? '#CC0000' : '#008000';
        const sign = num < 0 ? '-' : '+';

        return (
            <Typography sx={{ fontWeight: 'bold', color: color, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                {sign}{formatString} EUR
            </Typography>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" sx={{ textTransform: 'uppercase', color: '#333', mb: 0.5, fontSize: '1.4rem', fontWeight: 400 }}>
                        Vos Comptes
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenModal(true)}
                    sx={{
                        bgcolor: '#002B5E',
                        color: '#FFFFFF',
                        px: 3,
                        py: 1,
                        borderRadius: 0,
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#001D40' }
                    }}
                >
                    Nouveau Compte
                </Button>
            </Box>

            <Grid container>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Situation Globale
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 3 }}>
                            {loading ? (
                                <Typography>Chargement...</Typography>
                            ) : accounts.length === 0 ? (
                                <Typography sx={{ color: '#666', textAlign: 'center', py: 4 }}>Aucun compte ouvert</Typography>
                            ) : (
                                accounts.map((account, index) => (
                                    <Box
                                        key={account.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: index === accounts.length - 1 ? 'none' : '1px solid #E5E5E5',
                                            pb: index === accounts.length - 1 ? 0 : 2,
                                            mb: index === accounts.length - 1 ? 0 : 2
                                        }}
                                    >
                                        <Box>
                                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#333', mb: 0.5 }}>
                                                {account.type_compte === 'courant' ? 'C/C EUROCOMPTE' : account.type_compte === 'epargne' ? 'LIVRET BLEU' : account.type_compte}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#333' }}>
                                                M {user?.prenom} {user?.nom}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                                {account.numero_compte}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <FormatCurrency amount={account.solde} />
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 0 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#002B5E', pb: 1, pt: 3, px: 4, textTransform: 'uppercase', borderBottom: '1px solid #E5E5E5' }}>
                    Ouverture de Compte
                </DialogTitle>
                <DialogContent sx={{ px: 4, pb: 4, pt: 3 }}>
                    <TextField
                        select
                        fullWidth
                        label="Type de compte"
                        value={newAccountType}
                        onChange={(e) => setNewAccountType(e.target.value)}
                        margin="normal"
                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                    >
                        <MenuItem value="courant">C/C EUROCOMPTE</MenuItem>
                        <MenuItem value="epargne">LIVRET BLEU</MenuItem>
                        <MenuItem value="pro">COMPTE PRO</MenuItem>
                    </TextField>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 4, bgcolor: '#002B5E', py: 1.5, borderRadius: 0, fontWeight: 'bold', '&:hover': { bgcolor: '#001D40' } }}
                        onClick={handleCreateAccount}
                    >
                        Valider
                    </Button>
                </DialogContent>
            </Dialog>
        </Container>
    );
}

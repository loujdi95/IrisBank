import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    AppBar,
    Toolbar,
    Avatar,
    Divider,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {
    AccountBalance,
    AccountBalanceWallet,
    ReceiptLong,
    SwapHoriz,
    Security,
    Notifications,
    Settings,
    ExitToApp,
    Add,
    CreditCard as CardIcon,
    ChevronRight,
    Search,
    Menu as MenuIcon
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [selectedTypeCompte, setSelectedTypeCompte] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token) {
            navigate('/');
            return;
        }

        if (storedUser) setUser(JSON.parse(storedUser));
        fetchAccounts(token);
    }, [navigate]);

    const fetchAccounts = async (token) => {
        try {
            const { data } = await axios.get(`${API_URL}/accounts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccounts(data);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async (typeCompte, typeCarte = null) => {
        setIsCreating(true);
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/accounts`, { type_compte: typeCompte, type_carte: typeCarte }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Le compte a été ouvert avec succès');
            fetchAccounts(token);
            handleCloseModal();
        } catch (error) {
            toast.error('Erreur technique lors de l\'ouverture du compte');
        } finally {
            setIsCreating(false);
        }
    };

    const handleAccountSelection = (type) => {
        if (type === 'courant') {
            setSelectedTypeCompte(type);
            setModalStep(2);
        } else {
            createAccount(type);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setTimeout(() => {
            setModalStep(1);
            setSelectedTypeCompte(null);
        }, 300);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) return (
        <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress color="primary" />
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F7F9' }}>
            {/* Top Navbar */}
            <AppBar position="static" sx={{ bgcolor: '#003399', elevation: 0 }}>
                <Toolbar component={Container} maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <img src="/logo.svg" alt="IrisBank Logo" style={{ height: '100px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                            <Button color="inherit" sx={{ fontWeight: 'bold' }}>Comptes</Button>
                            <Button color="inherit">Virements</Button>
                            <Button color="inherit">Cartes</Button>
                            <Button color="inherit">Épargne</Button>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton color="inherit"><Search /></IconButton>
                        <IconButton color="inherit"><Notifications /></IconButton>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'white', opacity: 0.3, mx: 1 }} />
                        <Button color="inherit" onClick={() => navigate('/profile')} startIcon={<Settings />}>
                            {user?.email.split('@')[0]}
                        </Button>
                        <IconButton onClick={handleLogout} color="inherit"><ExitToApp /></IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sub Nav (Breadcrumbs / Quick Actions) */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E0E4E8', py: 1.5 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 'bold' }}>
                        Accueil {'>'} Synthèse des comptes
                    </Typography>
                    <Button
                        startIcon={<Add />}
                        variant="contained"
                        size="medium"
                        sx={{
                            bgcolor: '#E2001A',
                            '&:hover': { bgcolor: '#bf0016' },
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(226, 0, 26, 0.2)'
                        }}
                        onClick={() => setOpenModal(true)}
                    >
                        Ouvrir un compte
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
                <Grid container spacing={4}>
                    {/* Left Panel: Accounts List */}
                    <Grid item xs={12} lg={8}>
                        <Paper elevation={0} sx={{ border: '1px solid #E0E4E8', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #E0E4E8', bgcolor: '#F9FAFB' }}>
                                <Typography variant="h6" sx={{ color: '#003399', fontWeight: 800 }}>Mes avoirs et crédits</Typography>
                            </Box>

                            <Box sx={{ p: 0 }}>
                                {accounts.map((account, idx) => (
                                    <Box
                                        key={account.id}
                                        sx={{
                                            p: 3,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: idx === accounts.length - 1 ? 'none' : '1px solid #E0E4E8',
                                            '&:hover': { bgcolor: '#F9FAFB' },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                Compte {account.type_compte.toUpperCase()}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                N° {account.numero_compte}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#003399' }}>
                                                {parseFloat(account.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'green', fontWeight: 'bold' }}>Solde disponible</Typography>
                                        </Box>
                                    </Box>
                                ))}
                                {accounts.length === 0 && (
                                    <Box sx={{ p: 6, textAlign: 'center' }}>
                                        <Typography color="textSecondary">Aucun compte ouvert pour le moment.</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>

                        {/* Recent Transactions Placeholder */}
                        <Paper elevation={0} sx={{ mt: 4, border: '1px solid #E0E4E8', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #E0E4E8', bgcolor: '#F9FAFB' }}>
                                <Typography variant="h6" sx={{ color: '#003399', fontWeight: 800 }}>Dernières opérations</Typography>
                            </Box>
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="textSecondary" variant="body2">Historique des transactions vide.</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Panel: Cards Visuals */}
                    <Grid item xs={12} lg={4}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#003399' }}>Mes cartes</Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {accounts.filter(a => a.type_carte).slice(0, 2).map((account, idx) => (
                                <Box key={account.id} className="realistic-card-wrapper" sx={{ mb: 6 }}>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#666' }}>
                                        CARTE LIÉE AU COMPTE {account.numero_compte.split('-')[2] || 'XXXX'}
                                    </Typography>
                                    <Cards
                                        number={
                                            account.type_carte === 'visa' ? '4' + account.numero_compte.replace(/[^0-9]/g, '').padEnd(15, '0') :
                                                account.type_carte === 'mastercard' ? '51' + account.numero_compte.replace(/[^0-9]/g, '').padEnd(14, '0') :
                                                    account.numero_compte.replace(/[^0-9]/g, '').padEnd(16, '0')
                                        }
                                        name={(user?.prenom && user?.nom) ? `${user.prenom} ${user.nom}`.toUpperCase() : user?.email.split('@')[0].toUpperCase()}
                                        expiry="12/28"
                                        cvc="***"
                                        focused=""
                                        issuer={account.type_carte}
                                    />
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Button size="small" variant="outlined" fullWidth sx={{ borderRadius: 0 }}>Gérer</Button>
                                        <Button size="small" variant="outlined" fullWidth sx={{ borderRadius: 0 }}>Opposition</Button>
                                    </Box>
                                </Box>
                            ))}

                            {accounts.filter(a => a.type_carte).length === 0 && (
                                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed #CCC' }}>
                                    <CardIcon sx={{ fontSize: 40, color: '#CCC', mb: 2 }} />
                                    <Typography variant="body2" color="textSecondary">Aucune carte active</Typography>
                                </Paper>
                            )}
                        </Box>

                        {/* Useful Links Section */}
                        <Paper elevation={0} sx={{ mt: 4, border: '1px solid #E0E4E8', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                            <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #E0E4E8' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Raccourcis</Typography>
                            </Box>
                            <List dense>
                                <ListItem button><ListItemIcon><SwapHoriz size="small" /></ListItemIcon><ListItemText primary="Faire un virement" /></ListItem>
                                <ListItem button><ListItemIcon><ReceiptLong size="small" /></ListItemIcon><ListItemText primary="Télécharger un RIB" /></ListItem>
                                <ListItem button><ListItemIcon><Security size="small" /></ListItemIcon><ListItemText primary="Contacter mon conseiller" /></ListItem>
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Create Account Modal */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, color: '#003399', pb: 1 }}>
                    {modalStep === 1 ? 'Ouvrir un compte' : 'Choisir sa carte'}
                </DialogTitle>
                <DialogContent>
                    {modalStep === 1 ? (
                        <>
                            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>Sélectionnez le type de compte IrisBank que vous souhaitez ouvrir immédiatement. La création est instantanée.</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => handleAccountSelection('courant')}
                                    disabled={isCreating}
                                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', borderColor: '#003399', color: '#003399', '&:hover': { bgcolor: '#EBF4FF' } }}
                                >
                                    Compte Courant Iris
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => handleAccountSelection('livret A')}
                                    disabled={isCreating}
                                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', borderColor: '#003399', color: '#003399', '&:hover': { bgcolor: '#EBF4FF' } }}
                                >
                                    Livret A
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => handleAccountSelection('PEL')}
                                    disabled={isCreating}
                                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', borderColor: '#003399', color: '#003399', '&:hover': { bgcolor: '#EBF4FF' } }}
                                >
                                    Plan Épargne Logement
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>Personnalisez votre Compte Courant Iris en choisissant votre carte bancaire.</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box
                                        onClick={() => createAccount(selectedTypeCompte, 'visa')}
                                        sx={{
                                            p: 2, border: '1px solid #E0E4E8', borderRadius: 2, cursor: 'pointer', transition: '0.2s',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: isCreating ? 'none' : 'auto', opacity: isCreating ? 0.5 : 1,
                                            '&:hover': { borderColor: '#003399', bgcolor: '#F9FAFB', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'top center', mb: -4 }}>
                                            <Cards number="4000000000000000" name={(user?.prenom && user?.nom) ? `${user.prenom} ${user.nom}`.toUpperCase() : user?.email.split('@')[0].toUpperCase()} expiry="12/28" cvc="***" preview={true} issuer="visa" />
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#003399' }}>Visa Classic</Typography>
                                        <Typography variant="caption" color="textSecondary">Incluse, internationale</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box
                                        onClick={() => createAccount(selectedTypeCompte, 'mastercard')}
                                        sx={{
                                            p: 2, border: '1px solid #E0E4E8', borderRadius: 2, cursor: 'pointer', transition: '0.2s',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: isCreating ? 'none' : 'auto', opacity: isCreating ? 0.5 : 1,
                                            '&:hover': { borderColor: '#E2001A', bgcolor: '#F9FAFB', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'top center', mb: -4 }}>
                                            <Cards number="5000000000000000" name={(user?.prenom && user?.nom) ? `${user.prenom} ${user.nom}`.toUpperCase() : user?.email.split('@')[0].toUpperCase()} expiry="12/28" cvc="***" preview={true} issuer="mastercard" />
                                        </Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#E2001A' }}>Mastercard Standard</Typography>
                                        <Typography variant="caption" color="textSecondary">Incluse, internationale</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    {modalStep === 2 && (
                        <Button onClick={() => setModalStep(1)} color="inherit" sx={{ fontWeight: 'bold', mr: 'auto' }}>Retour</Button>
                    )}
                    <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 'bold' }}>Annuler</Button>
                </DialogActions>
            </Dialog>

            {/* Footer */}
            <Box sx={{ bgcolor: 'white', borderTop: '1px solid #E0E4E8', py: 4, mt: 'auto' }}>
                <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                        © 2026 IrisBank - Sécurité et Confidentialité | Mentions Légales | Cookies
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}

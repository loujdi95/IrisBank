import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Avatar
} from '@mui/material';
import { Delete, AddCircle, SupportAgent, PersonOutline, LocalPhoneOutlined, LocationOnOutlined, ShieldOutlined, MailOutline, ChatBubbleOutline } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [advisor, setAdvisor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [openBenModal, setOpenBenModal] = useState(false);
    const [newBen, setNewBen] = useState({ nom: '', iban: '' });
    const [formData, setFormData] = useState({
        telephone: '',
        adresse_postale: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setFormData({
                telephone: storedUser.telephone || '',
                adresse_postale: storedUser.adresse_postale || ''
            });
            const storedBen = localStorage.getItem(`beneficiaries_${storedUser.id}`);
            if (storedBen) setBeneficiaries(JSON.parse(storedBen));
        }
        
        fetchAdvisor();
        setLoading(false);
    }, [navigate]);

    const fetchAdvisor = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/messages/advisor`, { headers: { Authorization: `Bearer ${token}` } });
            setAdvisor(res.data);
        } catch (error) {
            console.error('Advisor fetch error:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.put(`${API_URL}/users/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            toast.success('Profil mis à jour avec succès');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setSaving(false);
        }
    };

    const handleAddBeneficiary = (e) => {
        e.preventDefault();
        if (!newBen.nom || !newBen.iban) return toast.error("Veuillez remplir le nom et l'IBAN");

        const updatedList = [...beneficiaries, newBen];
        setBeneficiaries(updatedList);
        localStorage.setItem(`beneficiaries_${user.id}`, JSON.stringify(updatedList));
        toast.success("Bénéficiaire ajouté avec succès");
        setOpenBenModal(false);
        setNewBen({ nom: '', iban: '' });
    };

    const handleDeleteBeneficiary = (index) => {
        const updatedList = beneficiaries.filter((_, i) => i !== index);
        setBeneficiaries(updatedList);
        localStorage.setItem(`beneficiaries_${user.id}`, JSON.stringify(updatedList));
        toast.success("Bénéficiaire supprimé");
    };

    if (loading) return (
        <Box sx={{ display: 'flex', minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: 'var(--iris-blue)' }} />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--iris-text)', mb: 1 }}>Profil et Paramètres</Typography>
                <Typography variant="body2" sx={{ color: 'var(--iris-text-light)' }}>
                    Gérez vos informations personnelles, votre sécurité et vos bénéficiaires.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Main Column */}
                <Grid item xs={12} md={8}>
                    {/* Personal Info Card */}
                    <Box className="minimal-group-card" sx={{ mb: 4 }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid var(--iris-border)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <PersonOutline sx={{ color: 'var(--iris-text-light)' }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Informations Personnelles</Typography>
                        </Box>
                        
                        <Box sx={{ p: 4 }}>
                            <Grid container spacing={4} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography className="text-pro-sub" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identité</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'var(--iris-text)' }}>
                                        {user?.prenom} {user?.nom}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography className="text-pro-sub" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adresse Email</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'var(--iris-text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {user?.email}
                                        <Box sx={{ px: 1, py: 0.2, bgcolor: '#DCFCE7', color: '#166534', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>VÉRIFIÉ</Box>
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

                            <form onSubmit={handleSave}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--iris-text)', mb: 3, textTransform: 'uppercase' }}>Édition des coordonnées</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <LocalPhoneOutlined sx={{ fontSize: '1.1rem', color: 'var(--iris-text-light)' }} />
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>TÉLÉPHONE</Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            name="telephone"
                                            size="small"
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <LocationOnOutlined sx={{ fontSize: '1.1rem', color: 'var(--iris-text-light)' }} />
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>ADRESSE POSTALE</Typography>
                                        </Box>
                                        <TextField
                                            fullWidth
                                            name="adresse_postale"
                                            size="small"
                                            value={formData.adresse_postale}
                                            onChange={handleChange}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={saving}
                                            sx={{ 
                                                px: 4, 
                                                py: 1.2, 
                                                borderRadius: '12px',
                                                bgcolor: 'var(--iris-text)', 
                                                '&:hover': { bgcolor: 'black' } 
                                            }}
                                        >
                                            {saving ? 'Enregistrement...' : 'Mettre à jour mon profil'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Box>
                    </Box>

                    {/* Security Card */}
                    <Box className="minimal-group-card">
                        <Box sx={{ p: 3, borderBottom: '1px solid var(--iris-border)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <ShieldOutlined sx={{ color: 'var(--iris-text-light)' }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Sécurité et Accès</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <List disablePadding>
                                <ListItem sx={{ borderBottom: '1px solid var(--iris-border)', py: 2 }}>
                                    <ListItemText 
                                        primary={<Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Mot de passe</Typography>}
                                        secondary="Modifier votre secret d'accès"
                                    />
                                    <Button size="small" sx={{ color: 'var(--iris-blue)' }}>Modifier</Button>
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid var(--iris-border)', py: 2 }}>
                                    <ListItemText 
                                        primary={<Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Double authentification</Typography>}
                                        secondary="Sécurisez vos opérations sensibles"
                                    />
                                    <Box sx={{ px: 1, py: 0.2, bgcolor: '#FEF3C7', color: '#92400E', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>DESACTIVÉ</Box>
                                </ListItem>
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemText 
                                        primary={<Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Historique de connexion</Typography>}
                                        secondary="Voir les dernières activités"
                                    />
                                    <Button size="small" sx={{ color: 'var(--iris-text-light)' }}>Consulter</Button>
                                </ListItem>
                            </List>
                        </Box>
                    </Box>
                </Grid>

                {/* Sidebar Column */}
                <Grid item xs={12} md={4}>
                    {/* Advisor Card */}
                    <Box className="minimal-group-card" sx={{ mb: 4, background: 'linear-gradient(180deg, #F8FAFC 0%, white 100%)' }}>
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'var(--iris-blue-light)', color: 'var(--iris-blue)' }}>
                                <SupportAgent sx={{ fontSize: '2.5rem' }} />
                            </Avatar>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{advisor ? `${advisor.prenom} ${advisor.nom}` : 'Votre Conseiller'}</Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>Conseiller dédié IrisBank</Typography>
                            
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                                    <MailOutline sx={{ fontSize: '0.9rem', color: 'var(--iris-text-light)' }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{advisor?.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <LocationOnOutlined sx={{ fontSize: '0.9rem', color: 'var(--iris-text-light)' }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Agence Paris Centre</Typography>
                                </Box>
                            </Box>

                            <Button 
                                fullWidth 
                                variant="outlined" 
                                startIcon={<ChatBubbleOutline />}
                                onClick={() => navigate('/messagerie')}
                                sx={{ 
                                    borderRadius: '12px', 
                                    borderColor: 'var(--iris-blue)', 
                                    color: 'var(--iris-blue)',
                                    py: 1
                                }}
                            >
                                Contacter {advisor?.prenom || 'votre conseiller'}
                            </Button>
                        </Box>
                    </Box>

                    {/* Beneficiaries Card */}
                    <Box className="minimal-group-card">
                        <Box sx={{ p: 2.5, borderBottom: '1px solid var(--iris-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Mes Bénéficiaires</Typography>
                            <IconButton size="small" onClick={() => setOpenBenModal(true)} sx={{ color: 'var(--iris-blue)' }}>
                                <AddCircle />
                            </IconButton>
                        </Box>
                        
                        <Box sx={{ p: 1, maxHeight: '350px', overflowY: 'auto' }}>
                            {beneficiaries.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
                                    <Typography variant="body2">Aucun bénéficiaire.</Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {beneficiaries.map((ben, idx) => (
                                        <ListItem 
                                            key={idx} 
                                            sx={{ 
                                                borderRadius: '10px', 
                                                mb: 1, 
                                                '&:hover': { bgcolor: '#F8FAFC' } 
                                            }}
                                            secondaryAction={
                                                <IconButton edge="end" size="small" onClick={() => handleDeleteBeneficiary(idx)}>
                                                    <Delete fontSize="small" sx={{ color: 'var(--iris-text-light)', '&:hover': { color: 'var(--iris-red)' } }} />
                                                </IconButton>
                                            }
                                        >
                                            <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.8rem', bgcolor: '#F1F5F9', color: 'var(--iris-text)' }}>
                                                {ben.nom.charAt(0)}
                                            </Avatar>
                                            <ListItemText 
                                                primary={<Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{ben.nom}</Typography>}
                                                secondary={<Typography variant="caption" sx={{ color: 'var(--iris-text-light)', fontFamily: 'monospace' }}>{ben.iban}</Typography>}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Modal Ajout Bénéficiaire */}
            <Dialog open={openBenModal} onClose={() => setOpenBenModal(false)} PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem' }}>Nouveau Bénéficiaire</DialogTitle>
                <form onSubmit={handleAddBeneficiary}>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 3, color: 'var(--iris-text-light)' }}>
                            Ajoutez un nouveau destinataire pour vos futurs virements.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Nom du bénéficiaire"
                            variant="filled"
                            value={newBen.nom}
                            onChange={(e) => setNewBen({ ...newBen, nom: e.target.value })}
                            required
                            sx={{ mb: 2, '& .MuiFilledInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            fullWidth
                            label="IBAN"
                            variant="filled"
                            placeholder="FR76..."
                            value={newBen.iban}
                            onChange={(e) => setNewBen({ ...newBen, iban: e.target.value })}
                            required
                            sx={{ '& .MuiFilledInput-root': { borderRadius: '12px' } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenBenModal(false)} sx={{ color: 'var(--iris-text-light)' }}>Annuler</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{ 
                                bgcolor: 'var(--iris-blue)', 
                                px: 4, 
                                borderRadius: '12px' 
                            }}
                        >
                            Enregistrer
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}

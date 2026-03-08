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
    ListItemText
} from '@mui/material';
import { Delete, AddCircle } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
    const [user, setUser] = useState(null);
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
        setLoading(false);
    }, [navigate]);

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

            // Update local storage with fresh user data
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
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ textTransform: 'uppercase', color: '#333', mb: 0.5, fontSize: '1.4rem', fontWeight: 400 }}>
                    Mon Profil et Sécurité
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Informations Personnelles
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 3 }}>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', mb: 0.5 }}>Nom complet</Typography>
                                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#333' }}>
                                        {user?.prenom} {user?.nom}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', mb: 0.5 }}>Email de contact</Typography>
                                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#333' }}>
                                        {user?.email}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ mb: 3 }} />

                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase', mb: 3 }}>
                                Coordonnées
                            </Typography>

                            <form onSubmit={handleSave}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#333', fontWeight: 'bold', mb: 1 }}>TÉLÉPHONE</Typography>
                                        <TextField
                                            fullWidth
                                            name="telephone"
                                            variant="outlined"
                                            size="small"
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography sx={{ fontSize: '0.8rem', color: '#333', fontWeight: 'bold', mb: 1 }}>ADRESSE POSTALE</Typography>
                                        <TextField
                                            fullWidth
                                            name="adresse_postale"
                                            variant="outlined"
                                            size="small"
                                            value={formData.adresse_postale}
                                            onChange={handleChange}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={saving}
                                            disableElevation
                                            sx={{
                                                bgcolor: '#D3002D',
                                                borderRadius: 0,
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                fontWeight: 'bold',
                                                '&:hover': { bgcolor: '#A00022' }
                                            }}
                                        >
                                            {saving ? 'Enregistrement...' : 'Valider les modifications'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Sécurité
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 2 }}>
                            <Typography sx={{ fontSize: '0.85rem', color: '#002B5E', fontWeight: 'bold', cursor: 'pointer', mb: 2, textDecoration: 'underline' }}>
                                Modifier mon mot de passe
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#002B5E', fontWeight: 'bold', cursor: 'pointer', mb: 2, textDecoration: 'underline' }}>
                                Gérer mes appareils de confiance
                            </Typography>
                            <Typography sx={{ fontSize: '0.85rem', color: '#002B5E', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                                Historique des connexions
                            </Typography>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent', mt: 4 }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                Mes Bénéficiaires
                            </Typography>
                            <IconButton size="small" sx={{ color: '#002B5E' }} onClick={() => setOpenBenModal(true)}>
                                <AddCircle />
                            </IconButton>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, maxHeight: '250px', overflowY: 'auto' }}>
                            {beneficiaries.length === 0 ? (
                                <Typography sx={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', py: 2 }}>Aucun bénéficiaire enregistré.</Typography>
                            ) : (
                                <List disablePadding>
                                    {beneficiaries.map((ben, idx) => (
                                        <ListItem key={idx} sx={{ px: 0, borderBottom: '1px solid #F0F0F0' }} secondaryAction={
                                            <IconButton edge="end" aria-label="delete" size="small" sx={{ color: '#D3002D' }} onClick={() => handleDeleteBeneficiary(idx)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        }>
                                            <ListItemText
                                                primary={<Typography sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#333' }}>{ben.nom}</Typography>}
                                                secondary={<Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{ben.iban}</Typography>}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Modal Ajout Bénéficiaire */}
            <Dialog open={openBenModal} onClose={() => setOpenBenModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ bgcolor: '#F4F4F4', color: '#002B5E', fontWeight: 'bold', fontSize: '1.1rem' }}>Ajouter un bénéficiaire</DialogTitle>
                <form onSubmit={handleAddBeneficiary}>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Nom du bénéficiaire"
                            placeholder="Ex: Jean Dupont"
                            size="small"
                            value={newBen.nom}
                            onChange={(e) => setNewBen({ ...newBen, nom: e.target.value })}
                            required
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            fullWidth
                            label="IBAN"
                            placeholder="FR76..."
                            size="small"
                            value={newBen.iban}
                            onChange={(e) => setNewBen({ ...newBen, iban: e.target.value })}
                            required
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenBenModal(false)} sx={{ color: '#666' }}>Annuler</Button>
                        <Button type="submit" variant="contained" sx={{ bgcolor: '#002B5E', '&:hover': { bgcolor: '#001D40' } }}>Enregistrer</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}

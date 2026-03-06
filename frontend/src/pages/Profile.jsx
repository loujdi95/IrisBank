import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    AppBar,
    Toolbar,
    IconButton,
    Divider,
    CircularProgress,
    Grid
} from '@mui/material';
import {
    Home as HomeIcon,
    ArrowBack,
    Save
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
            // We assume the stored user has these fields. Ideally we'd fetch fresh data.
            setFormData({
                telephone: storedUser.telephone || '',
                adresse_postale: storedUser.adresse_postale || ''
            });
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

    if (loading) return (
        <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F5F7F9' }}>
            <AppBar position="static" sx={{ bgcolor: '#003399', elevation: 0 }}>
                <Toolbar component={Container} maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IconButton color="inherit" onClick={() => navigate('/dashboard')}><ArrowBack /></IconButton>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>IrisBank</Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 6, mb: 10, flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#003399', mb: 4 }}>
                    Mon Profil
                </Typography>

                <Paper elevation={0} sx={{ border: '1px solid #E0E4E8', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ p: 4, bgcolor: 'white' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}>
                            Informations Personnelles
                        </Typography>

                        <Grid container spacing={4} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="textSecondary">Nom complet</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {user?.prenom} {user?.nom}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="textSecondary">Email de contact</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {user?.email}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ mb: 4 }} />

                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}>
                            Coordonnées (Éditables)
                        </Typography>

                        <form onSubmit={handleSave}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Téléphone</Typography>
                                    <TextField
                                        fullWidth
                                        name="telephone"
                                        variant="outlined"
                                        size="small"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Adresse Postale</Typography>
                                    <TextField
                                        fullWidth
                                        name="adresse_postale"
                                        variant="outlined"
                                        size="small"
                                        value={formData.adresse_postale}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<Save />}
                                        disabled={saving}
                                        sx={{ bgcolor: '#003399', borderRadius: 8, px: 4, py: 1.5, '&:hover': { bgcolor: '#002266' } }}
                                    >
                                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

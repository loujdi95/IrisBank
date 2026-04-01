import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Tabs,
    Tab,
    IconButton,
    InputAdornment,
    AppBar,
    Toolbar,
    Link,
    Divider
} from '@mui/material';
import {
    Search,
    Visibility,
    VisibilityOff,
    HelpOutline,
    LockOutlined,
    Home as HomeIcon,
    ArrowForwardIos
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/auth';

export default function Login() {
    const [tabValue, setTabValue] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        telephone: '',
        adresse_postale: '',
        date_naissance: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isLogin = tabValue === 0;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = isLogin ? '/login' : '/register';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const res = await axios.post(`${API_URL}${endpoint}`, payload);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success(isLogin ? 'Authentification réussie' : 'Inscription validée');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Identifiant ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F5F7F9' }}>
            {/* Upper Top Nav (Context) */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid var(--iris-border)', py: 0.5 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex' }}>
                        {['Particuliers', 'Auto-entrepreneurs', 'Professionnels', 'Entreprises', 'Agriculteurs', 'Associations'].map((item, id) => (
                            <Link
                                key={id}
                                href="#"
                                underline="none"
                                className={`bank-header-link ${item === 'Particuliers' ? 'active' : ''}`}
                            >
                                {item}
                            </Link>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Link href="#" className="bank-header-link" sx={{ fontSize: '0.75rem !important' }}>Site institutionnel</Link>
                        <Link href="#" className="bank-header-link" sx={{ fontSize: '0.75rem !important' }}>Centre d'aide</Link>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--iris-text-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            FR <Box component="span" sx={{ fontSize: '0.6rem' }}>▼</Box>
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Main Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid var(--iris-border)', py: 1.5 }}>
                <Toolbar component={Container} maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Box sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/')}>
                            <img src="/logo.png" alt="IrisBank Logo" style={{ height: '54px', objectFit: 'contain' }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ border: '1px solid var(--iris-border)', bgcolor: '#F8FAFC' }}><HomeIcon fontSize="small" /></IconButton>
                            <IconButton size="small" sx={{ border: '1px solid var(--iris-border)', bgcolor: '#F8FAFC' }}><Search fontSize="small" /></IconButton>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Page Content */}
            <Box sx={{ bgcolor: '#F8FAFC', flexGrow: 1, pt: 8, pb: 12 }}>
                <Container maxWidth="md">
                    <Typography variant="h4" align="center" sx={{ fontWeight: 800, color: 'var(--iris-blue)', mb: 6, letterSpacing: '-0.02em' }}>
                        Se connecter
                    </Typography>

                    <Paper elevation={0} className="premium-card">
                        {/* Tabs Header */}
                        <Box sx={{ borderBottom: 1, borderColor: 'var(--iris-border)' }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                centered
                                sx={{
                                    '& .MuiTabs-indicator': { height: 3, bgcolor: 'var(--iris-blue)', borderRadius: '3px 3px 0 0' },
                                    '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', py: 3, px: 4, color: 'var(--iris-text-light)', '&.Mui-selected': { color: 'var(--iris-blue)' } }
                                }}
                            >
                                <Tab label="Identifiant / Mot de passe" />
                                <Tab label="Certificat Électronique" disabled />
                                <Tab label="SAFETRANS" disabled />
                            </Tabs>
                        </Box>

                        {/* Form Area */}
                        <Box sx={{ p: { xs: 4, md: 8 } }}>
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 460, mx: 'auto' }}>
                                    <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box component="span" sx={{ color: 'var(--iris-red)' }}>*</Box> Information obligatoire
                                    </Typography>

                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'var(--iris-text)' }}>
                                            Email <Box component="span" sx={{ color: 'var(--iris-red)' }}>*</Box>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="email"
                                            placeholder="votre@email.fr"
                                            required
                                            variant="outlined"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'var(--iris-text)' }}>
                                            Mot de passe <Box component="span" sx={{ color: 'var(--iris-red)' }}>*</Box>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            variant="outlined"
                                            value={formData.password}
                                            onChange={handleChange}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>

                                    {!isLogin && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'var(--iris-text)' }}>Téléphone</Typography>
                                                <TextField fullWidth name="telephone" onChange={handleChange} value={formData.telephone} />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'var(--iris-text)' }}>Adresse Postale</Typography>
                                                <TextField fullWidth name="adresse_postale" onChange={handleChange} value={formData.adresse_postale} />
                                            </Box>
                                        </Box>
                                    )}

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            mt: 2,
                                            py: 2,
                                            fontSize: '1rem',
                                            borderRadius: '12px !important'
                                        }}
                                    >
                                        {loading ? 'Action en cours...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
                                    </Button>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                        <Link href="#" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--iris-blue)', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem', '&:hover': { textDecoration: 'underline' } }}>
                                            Codes d'accès oubliés <ArrowForwardIos sx={{ fontSize: 10 }} />
                                        </Link>
                                        <Link href="#" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--iris-blue)', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem', '&:hover': { textDecoration: 'underline' } }}>
                                            Infos sécurité <ArrowForwardIos sx={{ fontSize: 10 }} />
                                        </Link>
                                    </Box>

                                    <Divider sx={{ my: 2, borderColor: 'var(--iris-border)' }} />

                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'var(--iris-text-light)' }}>
                                            {isLogin ? "Nouveau client ?" : "Déjà client ?"} 
                                            <Link 
                                                component="button" 
                                                type="button"
                                                onClick={() => setTabValue(isLogin ? 1 : 0)} 
                                                sx={{ ml: 1, color: 'var(--iris-blue)', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                            >
                                                {isLogin ? "Ouvrir un compte" : "Se connecter"}
                                            </Link>
                                        </Typography>
                                    </Box>
                                </Box>
                            </form>
                        </Box>

                        {/* Tips Footer */}
                        <Box sx={{ bgcolor: 'var(--iris-blue-light)', p: 3, textAlign: 'center', borderTop: '1px solid var(--iris-border)' }}>
                            <Typography variant="body2" sx={{ color: 'var(--iris-blue)', fontWeight: 500 }}>
                                <strong>Astuce sécurité :</strong> Ne communiquez jamais vos codes d'accès par téléphone ou e-mail.
                            </Typography>
                        </Box>
                    </Paper>
                </Container>
            </Box>

            {/* Corporate Footer */}
            <Box sx={{ bgcolor: 'white', py: 6, borderTop: '1px solid var(--iris-border)' }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', fontWeight: 500 }}>
                        © 2026 IrisBank. Tous droits réservés.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                        {['Mentions légales', 'Données personnelles', 'Cookies', 'Accessibilité'].map((item) => (
                            <Link key={item} href="#" variant="caption" sx={{ color: 'var(--iris-text-light)', textDecoration: 'none', '&:hover': { color: 'var(--iris-blue)' } }}>
                                {item}
                            </Link>
                        ))}
                    </Box>
                </Container>
            </Box>

        </Box>
    );
}

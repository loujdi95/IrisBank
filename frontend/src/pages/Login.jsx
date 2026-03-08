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
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E0E4E8', py: 0.5 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex' }}>
                        {['Particuliers', 'Auto-entrepreneurs', 'Professionnels', 'Entreprises', 'Agriculteurs', 'Associations'].map((item, id) => (
                            <Link
                                key={id}
                                href="#"
                                underline="none"
                                className="bank-header-link"
                                sx={{ borderBottom: item === 'Particuliers' ? '2px solid #003399' : 'transparent', color: item === 'Particuliers' ? '#003399' : 'inherit' }}
                            >
                                {item}
                            </Link>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Link href="#" variant="caption" color="inherit" underline="none">Site institutionnel</Link>
                        <Link href="#" variant="caption" color="inherit" underline="none">Centre d'aide</Link>
                        <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>FR ▾</Typography>
                    </Box>
                </Container>
            </Box>

            {/* Main Header */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E0E4E8', py: 1 }}>
                <Toolbar component={Container} maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img src="/logo.png" alt="IrisBank Logo" style={{ height: '100px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                        <IconButton size="small" sx={{ border: '1px solid #E0E4E8', ml: 2, bgcolor: '#F5F7F9' }}><HomeIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ border: '1px solid #E0E4E8' }}><Search fontSize="small" /></IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Page Content */}
            <Container maxWidth="md" sx={{ mt: 8, mb: 4, flexGrow: 1 }}>
                <Typography variant="h4" align="center" sx={{ fontWeight: 800, color: '#003399', mb: 6 }}>
                    Se connecter
                </Typography>

                <Paper elevation={0} className="login-container">
                    {/* Tabs Header */}
                    <Box sx={{ borderBottom: 1, borderColor: '#E0E4E8' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            centered
                            sx={{
                                '& .MuiTabs-indicator': { height: 3, bgcolor: '#003399' },
                                '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', py: 2.5, px: 4 }
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 500, mx: 'auto' }}>
                                <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box component="span" sx={{ color: 'red' }}>*</Box> Information obligatoire
                                </Typography>

                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Email <Box component="span" sx={{ color: 'red' }}>*</Box>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        placeholder="Votre adresse email"
                                        required
                                        variant="outlined"
                                        value={formData.email}
                                        onChange={handleChange}
                                        sx={{ bgcolor: 'white' }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Mot de passe <Box component="span" sx={{ color: 'red' }}>*</Box>
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
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ bgcolor: 'white' }}
                                    />
                                </Box>

                                {!isLogin && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Téléphone</Typography>
                                            <TextField fullWidth name="telephone" onChange={handleChange} value={formData.telephone} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Adresse Postale</Typography>
                                            <TextField fullWidth name="adresse_postale" onChange={handleChange} value={formData.adresse_postale} />
                                        </Box>
                                    </Box>
                                )}

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        bgcolor: '#003399',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: '50px',
                                        '&:hover': { bgcolor: '#002266' }
                                    }}
                                >
                                    {loading ? 'Chargement...' : 'Se connecter'}
                                </Button>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                    <Link href="#" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#003399', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}>
                                        Codes d'accès oubliés <ArrowForwardIos sx={{ fontSize: 10 }} />
                                    </Link>
                                    <Link href="#" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#003399', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px' }}>
                                        Infos sécurité <ArrowForwardIos sx={{ fontSize: 10 }} />
                                    </Link>
                                </Box>

                                {!isLogin ? (
                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Link component="button" onClick={() => setTabValue(0)} sx={{ fontWeight: 'bold' }}>J'ai déjà un compte</Link>
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Typography variant="body2">Nouveau client ? </Typography>
                                        <Link component="button" onClick={() => setTabValue(1)} sx={{ fontWeight: 'bold' }}>Ouvrir un compte individuel</Link>
                                    </Box>
                                )}
                            </Box>
                        </form>
                    </Box>

                    {/* Tips Footer */}
                    <Box sx={{ bgcolor: '#EBF4FF', p: 3, textAlign: 'center', borderTop: '1px solid #E0E4E8' }}>
                        <Typography variant="subtitle2" sx={{ color: '#003399' }}>
                            <strong>Astuces :</strong> <Link href="#" sx={{ color: '#003399', textDecoration: 'underline' }}>Nos conseils pour sécuriser vos opérations et données.</Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>

            {/* Corporate Footer */}
            <Box sx={{ bgcolor: '#003399', py: 4, mt: 'auto' }}>
                <Container maxWidth="lg">
                    <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                        © 2026 IrisBank. Tous droits réservés.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}

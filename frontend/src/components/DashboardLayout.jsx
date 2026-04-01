import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery,
    Divider,
    Container
} from '@mui/material';
import { Search, PowerSettingsNew, WarningAmber, Close, ExpandMore, HomeOutlined } from '@mui/icons-material';
import axios from 'axios';

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null);
    const [advisor, setAdvisor] = useState(null);
    const [showAlert, setShowAlert] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchAdvisor();
    }, []);

    const fetchAdvisor = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/messages/advisor', { headers: { Authorization: `Bearer ${token}` } });
            setAdvisor(res.data);
        } catch (error) {
            console.error('Advisor fetch error:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const navLinks = [
        { text: 'Situation', path: '/dashboard' },
        { text: 'Comptes', path: '/comptes' },
        { text: 'Opérations', path: '/operations' },
        { text: 'Virements', path: '/virements' },
        { text: 'Messagerie', path: '/messagerie' },
        { text: 'Services', path: '/cartes' },
        { text: 'Profil et Sécurité', path: '/profile' },
        { text: 'Simulations', path: '/simulations' }
    ];

    if (user?.est_admin) {
        navLinks.push({ text: 'Administration', path: '/admin' });
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--iris-bg)' }}>
            {/* Top Corporate Header */}
            <Box sx={{ height: '36px', bgcolor: 'white', borderBottom: '1px solid var(--iris-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 4 }}>
                <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', mx: 2, fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'var(--iris-blue)' } }}>Site institutionnel</Typography>
                <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', mx: 2, fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'var(--iris-blue)' } }}>Centre d'aide</Typography>
                <Typography variant="caption" sx={{ color: 'var(--iris-text)', mx: 2, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    FR <ExpandMore sx={{ fontSize: '1rem' }} />
                </Typography>
                <Box sx={{ bgcolor: 'var(--iris-blue)', color: 'white', px: 3, height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', ml: 2, '&:hover': { bgcolor: 'var(--iris-blue-dark)' } }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>NOS OFFRES</Typography>
                </Box>
            </Box>

            {/* Main Navigation Bar */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: '#FFFFFF',
                    borderBottom: '1px solid var(--iris-border)',
                    color: 'var(--iris-text)'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '88px !important', px: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                            <img src="/logo.png" alt="IrisBank Logo" style={{ height: '54px', objectFit: 'contain' }} />
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ height: 32, my: 'auto', mx: 1, borderColor: 'var(--iris-border)' }} />

                        <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'var(--iris-text-light)', '&:hover': { color: 'var(--iris-blue)', bgcolor: 'var(--iris-blue-light)' } }}>
                            <HomeOutlined />
                        </IconButton>

                        {!isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {navLinks.map((link, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            color: location.pathname === link.path ? 'var(--iris-blue)' : 'var(--iris-text-light)',
                                            bgcolor: location.pathname === link.path ? 'var(--iris-blue-light)' : 'transparent',
                                            '&:hover': { color: 'var(--iris-blue)', bgcolor: 'var(--iris-blue-light)' }
                                        }}
                                        onClick={() => link.path && navigate(link.path)}
                                    >
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                            {link.text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Right Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {!isMobile && (
                            <Box sx={{ textAlign: 'right' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', fontWeight: 500 }}>Conseiller</Typography>
                                    <Box sx={{ bgcolor: 'var(--iris-red)', color: 'white', borderRadius: '4px', px: 0.8, py: 0.2, fontSize: '10px', fontWeight: 800 }}>
                                        0
                                    </Box>
                                </Box>
                                <Typography 
                                    variant="body2" 
                                    onClick={() => navigate('/messagerie')}
                                    sx={{ fontWeight: 700, color: 'var(--iris-text)', display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { color: 'var(--iris-blue)' } }}
                                >
                                    {advisor ? `${advisor.prenom} ${advisor.nom}` : 'Chargement...'}
                                    <ExpandMore sx={{ fontSize: '1.1rem', color: 'var(--iris-text-light)' }} />
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ width: '1px', height: '40px', bgcolor: 'var(--iris-border)', display: { xs: 'none', md: 'block' } }} />

                        <Box
                            onClick={handleLogout}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                px: 2,
                                py: 1,
                                borderRadius: '10px',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#FEF2F2', '& .logout-icon': { color: 'var(--iris-red)' }, '& .logout-text': { color: 'var(--iris-red)' } }
                            }}
                        >
                            <PowerSettingsNew className="logout-icon" sx={{ color: 'var(--iris-text-light)', fontSize: '1.4rem' }} />
                            {!isMobile && (
                                <Typography className="logout-text" sx={{ color: 'var(--iris-text)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Quitter
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Warning Banner */}
            {showAlert && (
                <Box sx={{ bgcolor: '#FFFBEB', py: 1.5, px: 3, borderBottom: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <WarningAmber sx={{ color: '#D97706', fontSize: '1.2rem' }} />
                            <Typography sx={{ color: '#92400E', fontSize: '14px', fontWeight: 500 }}>
                                Maintenance prévue le 8 mars 2026 de 00:00 à 06:00. Certains services seront indisponibles.
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setShowAlert(false)} sx={{ color: '#D97706' }}>
                            <Close sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                    </Container>
                </Box>
            )}

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 4, lg: 6 },
                    maxWidth: '1440px',
                    margin: '0 auto',
                    width: '100%'
                }}
            >
                {children || <Outlet />}
            </Box>
        </Box>

    );
}

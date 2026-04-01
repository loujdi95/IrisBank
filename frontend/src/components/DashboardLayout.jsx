import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Search,
    PowerSettingsNew,
    WarningAmber,
    Close,
    ExpandMore,
    HomeOutlined
} from '@mui/icons-material';

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null);
    const [showAlert, setShowAlert] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const navLinks = [
        { text: 'Situation', path: '/dashboard' },
        { text: 'Comptes', path: '/comptes' },
        { text: 'Opérations', path: '/virements' },
        { text: 'Services', path: '/cartes' },
        { text: 'Profil', path: '/profile' },
        { text: 'Simulations', path: '/simulations' }
    ];

    if (user?.est_admin) {
        navLinks.push({ text: 'Administration', path: '/admin' });
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F4F4F4' }}>
            {/* Top Corporate Header - very subtle, usually present in CM */}
            <Box sx={{ height: '30px', bgcolor: 'white', borderBottom: '1px solid #E5E5E5', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3 }}>
                <Typography variant="caption" sx={{ color: '#333', mx: 2, fontWeight: 'bold', cursor: 'pointer' }}>Site institutionnel</Typography>
                <Typography variant="caption" sx={{ color: '#333', mx: 2, fontWeight: 'bold', cursor: 'pointer' }}>Centre d'aide</Typography>
                <Typography variant="caption" sx={{ color: '#333', mx: 2, fontWeight: 'bold', cursor: 'pointer' }}>FR <ExpandMore sx={{ fontSize: '1rem', verticalAlign: 'middle' }} /></Typography>
                <Box sx={{ bgcolor: '#002B5E', color: 'white', px: 2, py: 0.5, height: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Nos offres</Typography>
                </Box>
            </Box>

            {/* Main Navigation Bar */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: '#FFFFFF',
                    borderBottom: '1px solid #E0E4E8',
                    color: '#333'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px !important', px: { xs: 2, md: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1, lg: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1 }} onClick={() => navigate('/dashboard')}>
                            <img src="/logo.png" alt="IrisBank Logo" style={{ height: '60px', objectFit: 'contain', transform: 'scale(1.8)', transformOrigin: 'left center', mixBlendMode: 'multiply', marginLeft: '10px', marginRight: '80px' }} />
                        </Box>

                        <IconButton onClick={() => navigate('/dashboard')} sx={{ color: '#333' }}>
                            <HomeOutlined />
                        </IconButton>

                        {!isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 1, lg: 2 }, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                                {navLinks.map((link, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            '&:hover': { color: '#002B5E' }
                                        }}
                                        onClick={() => link.path && navigate(link.path)}
                                    >
                                        <Typography sx={{ fontWeight: 400, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                            {link.text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Spacer to push actions to the right and prevent sticking */}
                    <Box sx={{ flexGrow: 1, minWidth: '24px' }} />

                    {/* Right: Actions & Logout */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, border: '1px solid #E5E5E5', borderRadius: '50%', display: 'flex', cursor: 'pointer', '&:hover': { bgcolor: '#F9F9F9' } }}>
                            <Search sx={{ color: '#333' }} />
                        </Box>

                        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' }, mr: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                <Typography variant="caption" sx={{ color: '#666' }}>Votre conseiller</Typography>
                                <Box sx={{ bgcolor: '#D3002D', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                    2
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                                M. {user?.prenom?.toUpperCase() || 'VINCENT'} {user?.nom?.toUpperCase() || 'DEPEAUX'}
                                <ExpandMore sx={{ fontSize: '1rem', color: '#666' }} />
                            </Typography>
                        </Box>

                        {/* Distinctive Déconnexion Button from Screenshot */}
                        <Box
                            onClick={handleLogout}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                padding: '10px 15px',
                                '&:hover': { bgcolor: '#F9F9F9' },
                                borderLeft: '1px solid #E5E5E5'
                            }}
                        >
                            <Box sx={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #E5E5E5', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 0.5 }}>
                                <PowerSettingsNew sx={{ color: '#002B5E', fontSize: '1.5rem' }} />
                            </Box>
                            <Typography sx={{ color: '#002B5E', fontWeight: 'bold', fontSize: '12px' }}>
                                Déconnexion
                            </Typography>
                        </Box>

                    </Box>
                </Toolbar>
            </AppBar>

            {/* Warning Banner */}
            {showAlert && (
                <Box sx={{ bgcolor: '#FAD99E', py: 1.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WarningAmber sx={{ color: '#553300' }} />
                        <Typography sx={{ color: '#333', fontSize: '14px' }}>
                            Nos services seront indisponibles du 8 mars 2026 à 00:00 au 8 mars 2026 à 06:00.
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setShowAlert(false)}>
                        <Close sx={{ fontSize: '1.2rem', color: '#333' }} />
                    </IconButton>
                </Box>
            )}

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 4 },
                    maxWidth: '1400px',
                    margin: '0 auto',
                    width: '100%'
                }}
            >
                {children || <Outlet />}
            </Box>
        </Box>
    );
}

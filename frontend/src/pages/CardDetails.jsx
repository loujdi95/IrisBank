import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    IconButton, 
    Container, 
    Paper, 
    Button, 
    LinearProgress, 
    Divider,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
    ArrowBackIosNew, 
    ForumOutlined, 
    KeyboardArrowRight, 
    SettingsOutlined,
    SettingsSuggestOutlined,
    DescriptionOutlined,
    CreditCardOutlined
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

const API_URL = 'http://localhost:5000/api';

export default function CardDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchCardDetails();
    }, [id]);

    const fetchCardDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/cards/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setCard(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement de la carte");
            navigate('/cartes');
        }
    };

    const handleToggleStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(`${API_URL}/cards/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setCard({ ...card, statut: res.data.statut });
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur de changement de statut");
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress sx={{ color: 'var(--iris-blue)' }} />
        </Box>
    );

    if (!card) return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Aucune donnée trouvée pour cette carte.</Typography>
            <Button onClick={() => navigate('/cartes')} sx={{ mt: 2 }}>Retour aux cartes</Button>
        </Box>
    );

    const depense = parseFloat(card.depense_actuelle || 0);
    const plafondPay = parseFloat(card.plafond_paiement || 2300);
    const retrait = parseFloat(card.retrait_actuel || 0);
    const plafondAtm = parseFloat(card.plafond_retrait || 1000);

    const payPercent = (depense / plafondPay) * 100;
    const atmPercent = (retrait / plafondAtm) * 100;

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh', pb: 10 }}>
            {/* Header Mobile-style */}
            <Box sx={{ 
                height: '60px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                px: 2, 
                borderBottom: '1px solid var(--iris-border)',
                bgcolor: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/cartes')}>
                    <ArrowBackIosNew sx={{ fontSize: '1.1rem', color: 'var(--iris-blue)' }} />
                    <Typography sx={{ color: 'var(--iris-blue)', fontWeight: 500 }}>Retour</Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, color: 'var(--iris-text)', fontSize: '1.05rem' }}>Détail de la carte</Typography>
                <IconButton onClick={() => navigate('/messagerie')}>
                    <ForumOutlined sx={{ color: 'var(--iris-blue)', fontSize: '1.4rem' }} />
                </IconButton>
            </Box>

            <Container maxWidth="sm" sx={{ py: 3 }}>
                {/* Real Card Visual */}
                <Paper sx={{ 
                    p: 2.5, 
                    borderRadius: '20px', 
                    border: '1px solid var(--iris-border)', 
                    mb: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.2 }}>CB Visa On line</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', mb: 2, display: 'block' }}>{card.numero_masque}</Typography>
                    
                    {/* The Physical Card Visualizer */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Box sx={{ transform: 'scale(1.1)', transformOrigin: 'center' }}>
                            <Cards
                                number={card.numero_masque.replace(/X/g, '0')}
                                name={`${card?.prenom || ''} ${card?.nom || ''}`}
                                expiry={card.date_expiration || '06/27'}
                                cvc=""
                                preview={true}
                                issuer="visa"
                            />
                        </Box>
                    </Box>

                    <Box sx={{ px: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--iris-text)' }}>Statut de la carte</Typography>
                            <Box sx={{ 
                                px: 1.5, 
                                py: 0.5, 
                                bgcolor: card.statut === 'actif' ? '#DCFCE7' : '#FEE2E2', 
                                color: card.statut === 'actif' ? '#166534' : '#991B1B', 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                fontWeight: 800
                            }}>
                                {card.statut?.toUpperCase() || 'ACTIF'}
                            </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'var(--iris-text-light)' }}>
                            Expiration : {card.date_expiration || '06/27'}
                        </Typography>
                    </Box>

                    {/* Apple Pay Row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F8FAFC', p: 1.5, borderRadius: '12px', cursor: 'pointer' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ border: '1px solid #ddd', borderRadius: '4px', px: 0.5, py: 0.2, bgcolor: 'white', fontSize: '10px', fontWeight: 800 }}>Pay</Box>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Ajoutée à Cartes d'Apple</Typography>
                        </Box>
                        <KeyboardArrowRight sx={{ color: 'var(--iris-text-light)' }} />
                    </Box>
                </Paper>

                {/* Segmented Control / Tabs */}
                <Box sx={{ mb: 4, bgcolor: '#F1F5F9', borderRadius: '12px', p: 0.5 }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, v) => setTabValue(v)} 
                        variant="fullWidth"
                        sx={{ 
                            minHeight: '36px',
                            '& .MuiTabs-indicator': { display: 'none' },
                            '& .MuiTab-root': {
                                borderRadius: '10px',
                                minHeight: '36px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                color: 'var(--iris-text-light)',
                                '&.Mui-selected': { 
                                    bgcolor: 'var(--iris-blue)', 
                                    color: 'white' 
                                }
                            }
                        }}
                    >
                        <Tab label="Sécurité" />
                        <Tab label="Services" />
                        <Tab label="Contrat" />
                    </Tabs>
                </Box>

                {/* Primary Action Button */}
                <Button 
                    fullWidth 
                    variant="contained" 
                    sx={{ 
                        py: 2.5, 
                        borderRadius: '24px', 
                        bgcolor: '#1E40AF', 
                        mb: 4, 
                        fontSize: '1rem', 
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#1e3a8a' }
                    }}
                >
                    Opposition
                </Button>

                {/* Usage Limits Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 4 }}>
                    {/* Payments */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <SettingsSuggestOutlined sx={{ color: 'var(--iris-text-light)' }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Plafond de paiements</Typography>
                                    <Typography sx={{ color: 'var(--iris-text-light)', fontSize: '0.85rem' }}>
                                        {plafondPay - depense} EUR disponibles sur {plafondPay} EUR
                                    </Typography>
                                </Box>
                            </Box>
                            <KeyboardArrowRight sx={{ color: 'var(--iris-blue)' }} />
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={payPercent} 
                            sx={{ height: 4, borderRadius: 2, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: 'var(--iris-blue)' } }} 
                        />
                    </Box>

                    {/* Withdrawals */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <SettingsSuggestOutlined sx={{ color: 'var(--iris-text-light)' }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Plafond de retraits</Typography>
                                    <Typography sx={{ color: 'var(--iris-text-light)', fontSize: '0.85rem' }}>
                                        {plafondAtm - retrait} EUR disponibles sur {plafondAtm} EUR
                                    </Typography>
                                </Box>
                            </Box>
                            <KeyboardArrowRight sx={{ color: 'var(--iris-blue)' }} />
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={atmPercent} 
                            sx={{ height: 4, borderRadius: 2, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: 'var(--iris-blue)' } }} 
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: '1px solid var(--iris-border)', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CreditCardOutlined sx={{ color: 'var(--iris-text-light)' }} />
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Numéros virtuels</Typography>
                            <Typography variant="body2" sx={{ color: 'var(--iris-text-light)' }}>Régler vos achats à distance avec Payweb Card.</Typography>
                        </Box>
                    </Box>
                    <KeyboardArrowRight sx={{ color: 'var(--iris-blue)' }} />
                </Box>

                {/* Secondary Action */}
                <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={handleToggleStatus}
                    sx={{ 
                        py: 2.5, 
                        borderRadius: '24px', 
                        bgcolor: '#EFF6FF', 
                        color: 'var(--iris-blue)', 
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#DBEAFE' }
                    }}
                >
                    {card.statut === 'bloque' ? 'Débloquer la carte' : 'Bloquer temporairement'}
                </Button>
            </Container>
        </Box>
    );
}

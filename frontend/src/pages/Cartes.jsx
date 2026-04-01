import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Grid, CircularProgress, Paper, Divider } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { KeyboardArrowRight, Security } from '@mui/icons-material';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';

const API_URL = 'http://localhost:5000/api';

export default function Cartes() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/cards`, { headers: { Authorization: `Bearer ${token}` } });
            setCards(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la récupération des cartes");
            setLoading(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: 'var(--iris-blue)' }} />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--iris-text)', mb: 1 }}>Mes Cartes</Typography>
                <Typography variant="body2" sx={{ color: 'var(--iris-text-light)' }}>
                    Gérez vos cartes bancaires, vos plafonds et votre sécurité en toute simplicité.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {cards.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
                            <Typography sx={{ color: 'var(--iris-text-light)' }}>Aucune carte active trouvée.</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    cards.map((card) => (
                        <Grid item xs={12} md={6} lg={4} key={card.id}>
                            <Paper 
                                onClick={() => navigate(`/cartes/${card.id}`)}
                                sx={{ 
                                    p: 0, 
                                    borderRadius: '20px', 
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    overflow: 'hidden',
                                    border: '1px solid #E2E8F0',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' }
                                }}
                            >
                                {/* Card Graphic Container */}
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
                                    <Box sx={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                                        <Cards
                                            number={card.numero_masque.replace(/X/g, '0')}
                                            name={`${user?.prenom || ''} ${user?.nom || ''}`}
                                            expiry={card.date_expiration || '06/27'}
                                            cvc=""
                                            preview={true}
                                            issuer="visa"
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>{card.type_carte || 'Visa On line'}</Typography>
                                        <Box sx={{ 
                                            px: 1, 
                                            py: 0.2, 
                                            bgcolor: card.statut === 'actif' ? '#DCFCE7' : '#FEE2E2', 
                                            color: card.statut === 'actif' ? '#166534' : '#991B1B', 
                                            borderRadius: '4px', 
                                            fontSize: '0.65rem', 
                                            fontWeight: 800
                                        }}>
                                            {card.statut?.toUpperCase() || 'ACTIF'}
                                        </Box>
                                    </Box>
                                    
                                    <Divider sx={{ mb: 2 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--iris-text-light)' }}>
                                            Compte: {card.numero_compte ? card.numero_compte.slice(-8) : 'N/A'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Security sx={{ fontSize: '0.9rem', color: 'var(--iris-blue)' }} />
                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--iris-blue)' }}>Gérer la sécurité</Typography>
                                            <KeyboardArrowRight sx={{ fontSize: '1rem', color: 'var(--iris-blue)' }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}

import { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css'; // Import the styles

const API_URL = 'http://localhost:5000/api';

export default function Cartes() {
    const [cards, setCards] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } });
            // Extract accounts that have a card
            const activeCards = res.data.filter(acc => acc.type_carte !== null && acc.type_carte !== 'none');
            setCards(activeCards);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la récupération des cartes");
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ textTransform: 'uppercase', color: '#333', mb: 0.5, fontSize: '1.4rem', fontWeight: 400 }}>
                    Vos Cartes Bancaires
                </Typography>
            </Box>

            <Grid container spacing={5}>
                {loading ? (
                    <Grid item xs={12}><Typography>Chargement des cartes...</Typography></Grid>
                ) : cards.length === 0 ? (
                    <Grid item xs={12}><Typography sx={{ color: '#666', fontSize: '1.1rem' }}>Aucune carte bancaire ne vous a été délivrée pour le moment.</Typography></Grid>
                ) : (
                    cards.map((card, index) => {
                        // Determine card specific visuals or colors if needed
                        let issuer = "mastercard";

                        // Fake a full 16 digit number for the display using their account ID or random if short
                        const last4 = card.numero_compte.slice(-4) || '1234';
                        const displayNumber = `5100 0000 0000 ${last4}`;

                        return (
                            <Grid item xs={12} md={6} lg={4} key={card.id}>
                                {/* Using official react-credit-cards-2 */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Cards
                                        number={displayNumber}
                                        name={`${user?.prenom?.toUpperCase() || ''} ${user?.nom?.toUpperCase() || ''}`}
                                        expiry="12/28"
                                        cvc=""
                                        issuer={issuer}
                                        preview={true} // Display as a valid front card
                                    />
                                </Box>

                                {/* Card Status & Actions (Below the card) */}
                                <Box sx={{ mt: 3, p: 2, bgcolor: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold', color: '#002B5E', fontSize: '0.9rem' }}>STATUT</Typography>
                                        <Typography sx={{ fontWeight: 'bold', color: '#008000', fontSize: '0.9rem' }}>ACTIVE</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 2 }}>
                                        Liée au compte : <br />
                                        <strong>{card.type_compte === 'courant' ? 'C/C EUROCOMPTE' : card.type_compte.toUpperCase()} - {card.numero_compte}</strong>
                                    </Typography>

                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #E5E5E5', cursor: 'pointer', '&:hover': { bgcolor: '#F9F9F9' } }}>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#002B5E', fontWeight: 'bold' }}>Faire opposition</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #E5E5E5', cursor: 'pointer', '&:hover': { bgcolor: '#F9F9F9' } }}>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#002B5E', fontWeight: 'bold' }}>Plafonds</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #E5E5E5', cursor: 'pointer', '&:hover': { bgcolor: '#F9F9F9' } }}>
                                                <Typography sx={{ fontSize: '0.8rem', color: '#002B5E', fontWeight: 'bold' }}>Voir le code secret</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        );
                    })
                )}
            </Grid>
        </Container>
    );
}

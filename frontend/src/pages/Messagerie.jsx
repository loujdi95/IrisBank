import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, IconButton, Avatar, CircularProgress, Container, Divider } from '@mui/material';
import { Send, AccountCircle, Badge, SupportAgent } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Messagerie() {
    const [messages, setMessages] = useState([]);
    const [advisor, setAdvisor] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchMessages, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchAdvisor(), fetchMessages()]);
        setLoading(false);
    };

    const fetchAdvisor = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/messages/advisor`, { headers: { Authorization: `Bearer ${token}` } });
            setAdvisor(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/messages`, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/messages`, { contenu: newMessage }, { headers: { Authorization: `Bearer ${token}` } });
            setNewMessage('');
            // Add message locally for instant feedback
            setMessages([...messages, { ...res.data, expediteur_prenom: user.prenom, expediteur_nom: user.nom }]);
        } catch (error) {
            toast.error("Erreur lors de l'envoi");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress sx={{ color: 'var(--iris-blue)' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--iris-text)', mb: 1 }}>Messagerie</Typography>
                <Typography variant="body2" sx={{ color: 'var(--iris-text-light)' }}>
                    Échangez en toute sécurité avec votre conseiller bancaire.
                </Typography>
            </Box>

            <Grid container spacing={0} sx={{ height: '70vh', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--iris-border)', bgcolor: 'white' }}>
                {/* Advisor Sidebar (Desktop) */}
                <Grid item xs={12} md={4} sx={{ borderRight: '1px solid var(--iris-border)', bgcolor: '#F8FAFC', p: 3, display: { xs: 'none', md: 'block' } }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'var(--iris-blue-light)', color: 'var(--iris-blue)' }}>
                            <SupportAgent sx={{ fontSize: '3rem' }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 800, color: 'var(--iris-text)' }}>
                            {advisor ? `${advisor.prenom} ${advisor.nom}` : 'Conseiller'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', display: 'block', mb: 2 }}>
                            Conseiller dédié IrisBank
                        </Typography>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: '#E0F2FE', borderRadius: '20px' }}>
                            <Box sx={{ width: 8, height: 8, bgcolor: '#0EA5E9', borderRadius: '50%' }} />
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369A1' }}>EN LIGNE</Typography>
                        </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--iris-text-light)', textTransform: 'uppercase', mb: 2 }}>Informations</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}><strong>Email:</strong> {advisor?.email}</Typography>
                        <Typography variant="body2"><strong>Agence:</strong> Paris Centre</Typography>
                    </Box>
                </Grid>

                {/* Chat Area */}
                <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Header Mobile */}
                    <Box sx={{ p: 2, borderBottom: '1px solid var(--iris-border)', display: { md: 'none' }, bgcolor: '#F8FAFC' }}>
                        <Typography sx={{ fontWeight: 800 }}>{advisor?.prenom} {advisor?.nom}</Typography>
                        <Typography variant="caption" color="textSecondary">Votre conseiller IrisBank</Typography>
                    </Box>

                    {/* Messages Body */}
                    <Box 
                        ref={scrollRef}
                        sx={{ 
                            flexGrow: 1, 
                            p: 3, 
                            overflowY: 'auto', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 2,
                            background: 'white'
                        }}
                    >
                        {messages.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                                <Typography variant="body2">Aucun message pour le moment.</Typography>
                                <Typography variant="caption">Envoyez votre premier message à votre conseiller.</Typography>
                            </Box>
                        )}
                        {messages.map((m, idx) => {
                            const isMine = m.expediteur_id === user.id;
                            return (
                                <Box key={idx} sx={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <Box 
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                            bgcolor: isMine ? 'var(--iris-blue)' : '#F1F5F9',
                                            color: isMine ? 'white' : 'var(--iris-text)'
                                        }}
                                    >
                                        <Typography variant="body2">{m.contenu}</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: isMine ? 'right' : 'left', color: 'var(--iris-text-light)', fontSize: '0.65rem' }}>
                                        {new Date(m.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Input Area */}
                    <Box sx={{ p: 2, borderTop: '1px solid var(--iris-border)', bgcolor: 'white' }}>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Écrire un message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <IconButton 
                                type="submit" 
                                disabled={!newMessage.trim() || sending}
                                sx={{ bgcolor: 'var(--iris-blue)', color: 'white', '&:hover': { bgcolor: 'var(--iris-blue-dark)' }, '&.Mui-disabled': { bgcolor: '#E2E8F0' } }}
                            >
                                <Send sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                        </form>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

// Helper components missing from previous context
import { Grid } from '@mui/material';

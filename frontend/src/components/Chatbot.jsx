import { useState } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Fab, Divider } from '@mui/material';
import { ChatBubbleOutline, Close, Send } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Bonjour ! Je suis l\'assistant IrisBank. Comment puis-je vous aider avec vos comptes aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            // If user not connected, don't pass token (though backend currently requires it)
            // Ideally we only show this chatbot if authenticated, or have a public fallback.
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const { data } = await axios.post(`${API_URL}/chat`, { message: userMsg }, { headers });

            setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Fab
                color="primary"
                aria-label="chat"
                onClick={() => setIsOpen(true)}
                sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: '#003399', '&:hover': { bgcolor: '#002266' } }}
            >
                <ChatBubbleOutline />
            </Fab>
        );
    }

    return (
        <Paper
            elevation={6}
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                width: 350,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box sx={{ bgcolor: '#003399', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Assistant IrisBank</Typography>
                <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsOpen(false)}>
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#F5F7F9', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((msg, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            bgcolor: msg.sender === 'user' ? '#003399' : 'white',
                            color: msg.sender === 'user' ? 'white' : 'text.primary',
                            p: 2,
                            borderRadius: 2,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            borderBottomRightRadius: msg.sender === 'user' ? 0 : 8,
                            borderBottomLeftRadius: msg.sender === 'ai' ? 0 : 8
                        }}
                    >
                        <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                ))}
            </Box>

            <Divider />

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Écrivez votre message..."
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
                    disabled={loading}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 5 } }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={loading || !input.trim()}>
                    <Send />
                </IconButton>
            </Box>
        </Paper>
    );
}

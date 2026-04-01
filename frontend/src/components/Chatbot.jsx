import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Paper, Typography, TextField, IconButton, Fab, Divider } from '@mui/material';
import { SmartToy, Close, Send } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

export default function Chatbot() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Bonjour. Je suis l\'Assistant Virtuel IrisBank. Comment puis-je vous accompagner aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    if (location.pathname === '/') return null;

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
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    bgcolor: '#002B5E',
                    '&:hover': { bgcolor: '#001D40' },
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    width: 60,
                    height: 60
                }}
            >
                <SmartToy sx={{ fontSize: 32, color: '#FFFFFF' }} />
            </Fab>
        );
    }

    return (
        <Paper
            elevation={3}
            className="chatbot-container"
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                width: 350,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
            }}
        >
            {/* Header */}
            <Box sx={{ bgcolor: '#002B5E', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Assistance IrisBank</Typography>
                <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsOpen(false)}>
                    <Close fontSize="small" />
                </IconButton>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#F5F7F9', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((msg, idx) => (
                    <Box
                        key={idx}
                        className={`chat-message ${msg.sender === 'user' ? 'chat-user-msg' : 'chat-ai-msg'}`}
                        sx={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                ))}

                {loading && (
                    <Box
                        className="chat-message chat-ai-msg"
                        sx={{
                            alignSelf: 'flex-start',
                            display: 'flex',
                            gap: 0.8,
                            alignItems: 'center',
                            minHeight: '44px' // roughly the height of a small text box
                        }}
                    >
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                    </Box>
                )}
                <div ref={messagesEndRef} />
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                />
                <IconButton sx={{ color: '#002B5E' }} onClick={handleSend} disabled={loading || !input.trim()}>
                    <Send />
                </IconButton>
            </Box>
        </Paper>
    );
}

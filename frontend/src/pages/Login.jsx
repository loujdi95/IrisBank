import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Paper, Alert, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        telephone: '',
        adresse_postale: '',
        date_naissance: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleToggle = (e, newValue) => {
        if (newValue !== null) {
            setIsLogin(newValue === 'login');
            setError('');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/login' : '/register';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const res = await axios.post(`${API_URL}${endpoint}`, payload);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        }
    };

    return (
        <Box className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <Paper elevation={3} className="w-full max-w-md p-8 rounded-2xl shadow-xl">
                <Typography variant="h4" component="h1" className="text-center font-bold text-blue-600 mb-6 font-[Outfit]">
                    IrisBank
                </Typography>

                <Box className="flex justify-center mb-6">
                    <ToggleButtonGroup
                        color="primary"
                        value={isLogin ? 'login' : 'register'}
                        exclusive
                        onChange={handleToggle}
                        className="w-full"
                    >
                        <ToggleButton value="login" className="w-1/2">Connexion</ToggleButton>
                        <ToggleButton value="register" className="w-1/2">Inscription</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {error && <Alert severity="error" className="mb-4">{error}</Alert>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <TextField
                        label="Adresse Email"
                        name="email"
                        type="email"
                        required
                        fullWidth
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Mot de passe"
                        name="password"
                        type="password"
                        required
                        fullWidth
                        value={formData.password}
                        onChange={handleChange}
                    />

                    {!isLogin && (
                        <div className="flex flex-col gap-4 mt-2">
                            <Typography variant="subtitle2" color="textSecondary" className="mb-[-8px]">
                                Informations complémentaires (Optionnel)
                            </Typography>
                            <TextField
                                label="Téléphone"
                                name="telephone"
                                fullWidth
                                value={formData.telephone}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Adresse Postale"
                                name="adresse_postale"
                                fullWidth
                                value={formData.adresse_postale}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Date de naissance"
                                name="date_naissance"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                value={formData.date_naissance}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-lg font-semibold transition-all hover:scale-[1.02]"
                    >
                        {isLogin ? 'Se connecter' : 'Créer un compte'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

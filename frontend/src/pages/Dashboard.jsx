import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Button,
    CircularProgress, AppBar, Toolbar, Avatar, IconButton, Divider
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token) {
            navigate('/');
            return;
        }

        if (storedUser) setUser(JSON.parse(storedUser));

        fetchAccounts(token);
    }, [navigate]);

    const fetchAccounts = async (token) => {
        try {
            const { data } = await axios.get(`${API_URL}/accounts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccounts(data);
        } catch (error) {
            console.error('Erreur de chargement des comptes', error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async (type) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/accounts`, { type_compte: type }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAccounts(token);
        } catch (error) {
            console.error('Erreur lors de la création du compte', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) return (
        <Box className="flex h-screen items-center justify-center">
            <CircularProgress size={60} />
        </Box>
    );

    return (
        <Box className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar Premium */}
            <AppBar position="static" elevation={0} className="bg-white text-gray-800 border-b border-gray-200">
                <Toolbar className="flex justify-between max-w-7xl mx-auto w-full">
                    <Typography variant="h5" className="font-bold text-blue-600">IrisBank</Typography>
                    <div className="flex items-center gap-4">
                        <Typography variant="body1" className="hidden md:block text-gray-600">
                            {user?.email}
                        </Typography>
                        <Avatar className="bg-blue-600 shadow-md">
                            {user?.email?.[0].toUpperCase()}
                        </Avatar>
                        <Button variant="outlined" color="error" onClick={handleLogout} className="ml-2 rounded-full px-6">
                            Déconnexion
                        </Button>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
                <Box className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <Typography variant="h4" className="font-bold text-gray-800 tracking-tight">
                        Mes Comptes Bancaires
                    </Typography>

                    <div className="flex gap-2">
                        <Button variant="contained" className="bg-blue-600 shadow-md hover:bg-blue-700" onClick={() => createAccount('courant')}>
                            + Courant
                        </Button>
                        <Button variant="contained" className="bg-teal-600 shadow-md hover:bg-teal-700" onClick={() => createAccount('livret A')}>
                            + Livret A
                        </Button>
                    </div>
                </Box>

                {accounts.length === 0 ? (
                    <Box className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <Typography variant="h6" className="text-gray-500 mb-4">
                            Vous n'avez aucun compte bancaire pour le moment.
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Ouvrez votre premier compte en utilisant les boutons ci-dessus.
                        </Typography>
                    </Box>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accounts.map(account => (
                            <Card
                                key={account.id}
                                className="rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
                            >
                                {/* Decorative Accent */}
                                <div className={`h-2 w-full ${account.type_compte === 'courant' ? 'bg-blue-500' : 'bg-teal-500'}`} />

                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Typography variant="overline" className="text-gray-500 font-semibold tracking-widest uppercase">
                                            Compte {account.type_compte}
                                        </Typography>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${account.statut_compte === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {account.statut_compte}
                                        </span>
                                    </div>

                                    <Typography variant="h3" className="font-bold text-gray-800 mb-1">
                                        {parseFloat(account.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </Typography>

                                    <Divider className="my-4" />

                                    <Typography variant="body2" className="font-mono text-gray-500 text-sm break-all">
                                        {account.numero_compte}
                                    </Typography>

                                    <div className="mt-6 flex gap-2">
                                        <Button variant="contained" size="small" className="bg-gray-800 text-white rounded-lg flex-1 hover:bg-gray-900">
                                            Virement
                                        </Button>
                                        <Button variant="outlined" size="small" className="border-gray-300 text-gray-700 rounded-lg flex-1 hover:bg-gray-50">
                                            Détails
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </Box>
    );
}

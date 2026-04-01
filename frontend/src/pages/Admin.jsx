import { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton, 
    Chip, 
    Tab, 
    Tabs,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar
} from '@mui/material';
import { 
    DeleteOutline, 
    AdminPanelSettings, 
    PersonOutline, 
    AccountBalanceWallet,
    TrendingUp,
    PeopleAlt
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Admin() {
    const [tabValue, setTabValue] = useState(0);
    const [users, setUsers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [usersRes, accountsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/users`, { headers }),
                axios.get(`${API_URL}/admin/accounts`, { headers })
            ]);
            
            setUsers(usersRes.data);
            setAccounts(accountsRes.data);
        } catch (error) {
            console.error('Erreur admin fetching', error);
            toast.error("Erreur lors de la récupération des données administrateur.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteUser = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/users/${userToDelete.id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            toast.success(`Utilisateur ${userToDelete.email} supprimé.`);
            fetchData();
        } catch (error) {
            console.error('Erreur suppression user', error);
            toast.error(error.response?.data?.message || "Erreur lors de la suppression.");
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const FormatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    return (
        <Box sx={{ pb: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#002B5E', fontWeight: 'bold', mb: 1 }}>
                        Espace Administration
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                        Gestion globale de la plateforme IrisBank
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E0E4E8' }}>
                        <PeopleAlt sx={{ color: '#002B5E' }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: '#666' }}>Total Clients</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{users.length}</Typography>
                        </Box>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #E0E4E8' }}>
                        <AccountBalanceWallet sx={{ color: '#D3002D' }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: '#666' }}>Total Comptes</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{accounts.length}</Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* Main Tabs Section */}
            <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E0E4E8' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F9FAFB' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, v) => setTabValue(v)}
                        sx={{
                            '& .MuiTabs-indicator': { backgroundColor: '#002B5E' },
                            '& .MuiTab-root.Mui-selected': { color: '#002B5E' }
                        }}
                    >
                        <Tab label="Gestion des Utilisateurs" />
                        <Tab label="Supervision des Comptes" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    {tabValue === 0 && (
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F4F4F4' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Rôle</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Inscrit le</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: '#EAF0F6', color: '#002B5E', fontSize: '1rem' }}>
                                                        {user.prenom?.[0]}{user.nom?.[0]}
                                                    </Avatar>
                                                    <Typography sx={{ fontWeight: 500 }}>
                                                        {user.prenom} {user.nom}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {user.est_admin ? (
                                                    <Chip 
                                                        icon={<AdminPanelSettings fontSize="small" />} 
                                                        label="Admin" 
                                                        size="small" 
                                                        sx={{ bgcolor: '#002B5E', color: 'white' }} 
                                                    />
                                                ) : (
                                                    <Chip 
                                                        icon={<PersonOutline fontSize="small" />} 
                                                        label="Client" 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    color="error" 
                                                    onClick={() => handleDeleteClick(user)}
                                                    disabled={user.est_admin}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {tabValue === 1 && (
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F4F4F4' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>IBAN</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Propriétaire</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Solde</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accounts.map((acc) => (
                                        <TableRow key={acc.id} hover>
                                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {acc.numero_compte}
                                            </TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize' }}>{acc.type_compte}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{acc.proprietaire_prenom} {acc.proprietaire_nom}</Typography>
                                                <Typography variant="caption" color="textSecondary">{acc.proprietaire_email}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: acc.solde < 0 ? '#D3002D' : '#008000' }}>
                                                {FormatCurrency(acc.solde)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={acc.statut_compte || 'actif'} 
                                                    size="small" 
                                                    color={acc.statut_compte === 'bloque' ? 'error' : 'success'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.prenom} {userToDelete?.nom}</strong> ? 
                        Cette action supprimera également tous ses comptes bancaires associés.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                    <Button onClick={confirmDeleteUser} variant="contained" color="error">
                        Supprimer définitivement
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Link } from '@mui/material';
import { Menu as MenuIcon, AddCircleOutline, InsertDriveFile, PictureAsPdf, Download, ArrowForward, HelpOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { jsPDF } from "jspdf";

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [accountTransactions, setAccountTransactions] = useState({});
    const [loading, setLoading] = useState(true);

    // Export Modal States
    const [exportOpen, setExportOpen] = useState(false);
    const [exportAccount, setExportAccount] = useState(null);
    const [exportMonth, setExportMonth] = useState('ALL');
    const [exportYear, setExportYear] = useState('ALL');

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const accRes = await axios.get(`${API_URL}/accounts`, { headers: { Authorization: `Bearer ${token}` } });
            setAccounts(accRes.data);

            if (accRes.data.length > 0) {
                const txMap = {};
                for (const acc of accRes.data) {
                    try {
                        const txRes = await axios.get(`${API_URL}/transactions/${acc.id}`, { headers: { Authorization: `Bearer ${token}` } });
                        // Sort by date descending and get top 4
                        txMap[acc.id] = txRes.data
                            .sort((a, b) => new Date(b.date_transaction) - new Date(a.date_transaction))
                            .slice(0, 4);
                    } catch (e) {
                        console.error(`Failed to fetch transactions for account ${acc.id}`);
                        txMap[acc.id] = [];
                    }
                }
                setAccountTransactions(txMap);
            }
            setLoading(false);
        } catch (error) {
            console.error('Erreur données dashboard', error);
            setLoading(false);
        }
    };

    const FormatCurrency = ({ amount }) => {
        const num = parseFloat(amount);
        const formatString = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(num));

        const color = num < 0 ? '#CC0000' : '#008000';
        const sign = num < 0 ? '-' : '+';

        return (
            <Typography sx={{ fontWeight: 'bold', color: color, fontSize: '0.9rem' }}>
                {sign}{formatString} EUR
            </Typography>
        );
    };

    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Assuming first two accounts for the columns
    const account1 = accounts.length > 0 ? accounts[0] : null;
    const account2 = accounts.length > 1 ? accounts[1] : null;

    // Get specific transactions for mockup display
    const txs1 = account1 ? (accountTransactions[account1.id] || []) : [];
    const txs2 = account2 ? (accountTransactions[account2.id] || []) : [];

    const openExportModal = (account) => {
        setExportAccount(account);
        setExportOpen(true);
    };

    const handleExportConfirm = async () => {
        setExportOpen(false);
        const toastId = toast.loading("Récupération de l'historique...");
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/transactions/${exportAccount.id}`, { headers: { Authorization: `Bearer ${token}` } });

            // Filter data
            const filteredData = data.filter(t => {
                const d = new Date(t.date_transaction);
                const matchYear = exportYear === 'ALL' || d.getFullYear().toString() === exportYear;
                const matchMonth = exportMonth === 'ALL' || (d.getMonth() + 1).toString() === exportMonth;
                return matchYear && matchMonth;
            });

            if (filteredData.length === 0) {
                toast.error("Aucune opération trouvée pour cette période.", { id: toastId });
                return;
            }

            const headers = ["Date", "Description", "Montant (EUR)"];
            const rows = filteredData.map(t => [
                new Date(t.date_transaction).toLocaleDateString('fr-FR'),
                t.description || t.libelle || '',
                t.montant
            ]);

            // Generate CSV string using a true delimiter
            const csvContent = headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");

            // Create a Blob with UTF-8 BOM for perfect Excel compatibility
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            link.setAttribute("href", url);
            link.setAttribute("download", `Operations_${exportAccount.numero_compte}_${exportMonth}-${exportYear}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Export réussi (${filteredData.length} lignes)`, { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'export.", { id: toastId });
        }
    };

    const downloadRIB = (account) => {
        if (!account) return;
        const doc = new jsPDF();

        // Colors & Backgrounds
        doc.setFillColor(0, 43, 94); // IrisBank Blue
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("IrisBank", 20, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("L'excellence bancaire au quotidien", 130, 25);

        // Title
        doc.setTextColor(0, 43, 94);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("RELEVÉ D'IDENTITÉ BANCAIRE", 20, 60);

        // Horizontal Line
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 65, 190, 65);

        // Agence Info Box
        doc.setFillColor(245, 247, 249);
        doc.rect(20, 75, 170, 30, 'F');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text("AGENCE IRISBANK PARIS CENTRE", 25, 85);
        doc.text("1 RUE DE LA BANQUE, 75001 PARIS", 25, 92);
        doc.text("Tel: 01 23 45 67 89 - Courriel: contact@irisbank.fr", 25, 99);

        // Titulaire
        doc.setFontSize(12);
        doc.setTextColor(0, 43, 94);
        doc.setFont("helvetica", "bold");
        doc.text("TITULAIRE DU COMPTE", 20, 125);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(`M ${user?.prenom?.toUpperCase()} ${user?.nom?.toUpperCase()}`, 20, 133);
        doc.setFont("helvetica", "normal");
        doc.text(`${user?.adresse_postale || '25 Avenue des Champs-Elysées, 75008 Paris'}`, 20, 140);

        // Coordonnees Bancaires Box
        doc.setDrawColor(0, 43, 94);
        doc.setLineWidth(1);
        doc.rect(20, 155, 170, 55);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 43, 94);
        doc.text("CODES BANCAIRES", 25, 165);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Banque", 25, 175);
        doc.text("Guichet", 55, 175);
        doc.text("N° Compte", 85, 175);
        doc.text("Clé RIB", 160, 175);

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("12345", 25, 183);
        doc.text("00001", 55, 183);
        const shortAcc = account.numero_compte.slice(-11);
        doc.text(shortAcc, 85, 183);
        doc.text("12", 160, 183);

        const mockIban = `FR76 1234 5000 01${shortAcc} 12`;
        doc.text(`IBAN : ${mockIban}`, 25, 195);
        doc.text(`BIC : IRISBFR1XXXX`, 25, 203);

        // Footer disclaimer
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Ce relevé est destiné à être remis, sur leur demande, à vos créanciers ou débiteurs, appelés à faire inscrire des", 20, 230);
        doc.text("opérations à votre compte (virements, prélèvements, etc.). Document délivré électroniquement.", 20, 235);

        doc.save(`RIB_IrisBank_${account.numero_compte}.pdf`);
        toast.success("RIB PDF généré avec succès");
    };

    return (
        <Box sx={{ pb: 12 }}>
            {/* User Header Section */}
            <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: 'var(--iris-blue)', fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                        Bonjour {user?.prenom || 'Rayane'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--iris-text-light)', fontWeight: 500 }}>
                        Dernière connexion le {formattedDate} à {formattedTime}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button 
                        variant="contained" 
                        size="small"
                        sx={{ 
                            bgcolor: 'var(--iris-blue-dark)', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            px: 3,
                            '&:hover': { bgcolor: 'var(--iris-blue)' }
                        }}
                    >
                        AGORA Sociétaires
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate('/messagerie')}
                        sx={{ 
                            borderColor: 'var(--iris-border)', 
                            color: 'var(--iris-text)',
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            px: 3,
                            '&:hover': { borderColor: 'var(--iris-blue)', color: 'var(--iris-blue)' }
                        }}
                    >
                        Ma Messagerie
                    </Button>
                </Box>
            </Box>

            {/* Account Grid */}
            <Grid container spacing={4}>
                {accounts.map((acc) => {
                    const txs = accountTransactions[acc.id] || [];
                    const isCourant = acc.type_compte === 'courant';
                    const isEpargne = acc.type_compte === 'livret A' || acc.type_compte === 'epargne';
                    
                    return (
                        <Grid item xs={12} md={6} lg={6} key={acc.id}>
                            <Paper elevation={0} className="premium-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                                {/* Card Header */}
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--iris-border)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box className={`account-indicator ${isCourant ? 'indicator-courant' : isEpargne ? 'indicator-epargne' : 'indicator-pel'}`} />
                                        <Box>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--iris-blue)', textTransform: 'uppercase', mb: 0.5, letterSpacing: '0.05em' }}>
                                                {acc.type_compte === 'courant' ? 'CB Visa Premier' : acc.type_compte === 'livret A' || acc.type_compte === 'epargne' ? 'Livret d\'Épargne' : acc.type_compte}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--iris-text)', mb: 0.5 }}>
                                                {isCourant ? 'Eurocompte Jeune' : 'Livret Bleu'}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--iris-text-light)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                                                {acc.numero_compte}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton size="small" sx={{ color: 'var(--iris-text-light)', bgcolor: '#F8FAFC' }}>
                                        <MenuIcon sx={{ fontSize: '1.2rem' }} />
                                    </IconButton>
                                </Box>

                                {/* Balance Area */}
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFBFC' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--iris-text-light)', mb: 1 }}>Solde disponible</Typography>
                                        <FormatCurrency amount={acc.solde} />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="white"
                                            size="small"
                                            onClick={() => downloadRIB(acc)}
                                            sx={{ borderRadius: '8px', border: '1px solid var(--iris-border)', px: 2, height: '32px', fontSize: '0.7rem' }}
                                        >
                                            RIB
                                        </Button>
                                        <Button
                                            variant="white"
                                            size="small"
                                            onClick={() => openExportModal(acc)}
                                            sx={{ borderRadius: '8px', border: '1px solid var(--iris-border)', px: 2, height: '32px', fontSize: '0.7rem' }}
                                        >
                                            RELEVÉ
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Transactions Area */}
                                <Box sx={{ p: 3, flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--iris-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Dernières opérations
                                        </Typography>
                                        <Link 
                                            component="button" 
                                            onClick={() => navigate('/operations')} 
                                            sx={{ fontSize: '0.75rem', color: 'var(--iris-blue)', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                        >
                                            Voir tout
                                        </Link>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {txs.map((tx, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--iris-text)', mb: 0.2 }}>
                                                            {tx.description}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.7rem', color: 'var(--iris-text-light)' }}>
                                                            {new Date(tx.date_transaction).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <FormatCurrency amount={tx.montant} />
                                            </Box>
                                        ))}
                                        {txs.length === 0 && (
                                            <Typography variant="caption" sx={{ color: 'var(--iris-text-light)', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                                                Aucune opération récente
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Quick Action Sidebar */}
            <Box sx={{ position: 'fixed', right: 24, bottom: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
                <Tooltip title="Besoin d'aide ?" placement="left">
                    <IconButton 
                        sx={{ 
                            bgcolor: 'var(--iris-blue)', 
                            color: 'white', 
                            boxShadow: '0 4px 12px rgba(0,51,153,0.3)',
                            '&:hover': { bgcolor: 'var(--iris-blue-dark)' }
                        }}
                    >
                        <HelpOutline />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Export Dialog */}
            <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800, color: 'var(--iris-blue)' }}>Exporter mes données</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, color: 'var(--iris-text-light)' }}>
                        Sélectionnez la période souhaitée pour le compte <strong>{exportAccount?.numero_compte}</strong>.
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Année</InputLabel>
                        <Select value={exportYear} label="Année" onChange={(e) => setExportYear(e.target.value)}>
                            <MenuItem value="ALL">Historique complet (3 ans)</MenuItem>
                            <MenuItem value="2026">2026</MenuItem>
                            <MenuItem value="2025">2025</MenuItem>
                            <MenuItem value="2024">2024</MenuItem>
                            <MenuItem value="2023">2023</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Mois</InputLabel>
                        <Select value={exportMonth} label="Mois" onChange={(e) => setExportMonth(e.target.value)} disabled={exportYear === 'ALL'}>
                            <MenuItem value="ALL">Tous les mois</MenuItem>
                            {[...Array(12)].map((_, i) => (
                                <MenuItem key={i + 1} value={(i + 1).toString()}>
                                    {new Date(2026, i).toLocaleString('fr-FR', { month: 'long' })}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={() => setExportOpen(false)} sx={{ color: 'var(--iris-text-light)', textTransform: 'none', fontWeight: 600 }}>Annuler</Button>
                    <Button onClick={handleExportConfirm} variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
                        Générer CSV
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

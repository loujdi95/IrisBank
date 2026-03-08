import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Menu as MenuIcon, AddCircleOutline, InsertDriveFile, PictureAsPdf, Download, ArrowForward } from '@mui/icons-material';
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
        <Box sx={{ pb: 8 }}>
            {/* User Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ textTransform: 'uppercase', color: '#333', mb: 0.5, fontSize: '1.4rem', fontWeight: 400 }}>
                    {user?.nom || 'CHEKROUN'} {user?.prenom || 'RAYANE'}, votre espace client
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', mb: 2 }}>
                    Dernière connexion le {formattedDate} à {formattedTime}.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ bgcolor: '#002B5E', color: 'white', px: 2, py: 0.5, borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        AGORA Sociétaires
                    </Box>
                    <Box sx={{ bgcolor: '#002B5E', color: 'white', px: 2, py: 0.5, borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        Sociétaires
                    </Box>
                </Box>
            </Box>

            {/* 3 Column Layout */}
            <Grid container spacing={3}>
                {/* Column 1: Situation */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E' }}>Situation</Typography>
                        </Box>

                        <Box sx={{ bgcolor: '#FFFFFF', p: 2, mt: 0.5 }}>
                            {accounts.map((acc, index) => (
                                <Box key={acc.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: index === accounts.length - 1 ? 0 : 3 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#333' }}>
                                            {acc.type_compte === 'courant' ? 'C/C EUROCOMPTE' : acc.type_compte === 'epargne' ? 'LIVRET BLEU' : acc.type_compte}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                            M {user?.prenom} {user?.nom}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                            {acc.numero_compte}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <MenuIcon sx={{ color: '#333', mb: 1 }} />
                                        <FormatCurrency amount={acc.solde} />
                                    </Box>
                                </Box>
                            ))}
                            {loading && <Typography>Chargement...</Typography>}
                        </Box>
                    </Paper>
                </Grid>

                {/* Column 2: Account 1 Details */}
                <Grid item xs={12} md={4}>
                    {account1 && (
                        <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                            <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                    {account1.type_compte === 'courant' ? 'C/C EUROCOMPTE JEUNE' : 'COMPTE ' + account1.type_compte}
                                </Typography>
                                <MenuIcon sx={{ color: '#333' }} />
                            </Box>

                            <Box sx={{ bgcolor: '#FFFFFF', mt: 0.5 }}>
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#333' }}>
                                            M {user?.prenom} {user?.nom}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                            {account1.numero_compte}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ alignSelf: 'flex-end' }}>
                                        <FormatCurrency amount={account1.solde} />
                                    </Box>
                                </Box>

                                {/* Action Buttons underneath the balance */}
                                <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 2, borderBottom: '1px solid #E5E5E5' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => downloadRIB(account1)}
                                        startIcon={<PictureAsPdf />}
                                        sx={{ borderRadius: 0, textTransform: 'none', color: '#002B5E', borderColor: '#002B5E', '&:hover': { bgcolor: '#F4F4F4' } }}
                                    >
                                        Éditer RIB
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => openExportModal(account1)}
                                        startIcon={<InsertDriveFile />}
                                        sx={{ borderRadius: 0, textTransform: 'none', color: '#002B5E', borderColor: '#002B5E', '&:hover': { bgcolor: '#F4F4F4' } }}
                                    >
                                        Exporter CSV
                                    </Button>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigate('/virements')}
                                        endIcon={<ArrowForward />}
                                        sx={{ ml: 'auto', borderRadius: 0, textTransform: 'none', color: '#002B5E', fontWeight: 'bold', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                                    >
                                        Voir plus
                                    </Button>
                                </Box>

                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#002B5E', cursor: 'pointer', mb: 2 }}>
                                        Dernières opérations
                                    </Typography>

                                    {txs1.map((tx, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E5E5', pb: 1, mb: 1 }}>
                                            <Box sx={{ width: '70%' }}>
                                                <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                                    {new Date(tx.date_transaction).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.85rem', textTransform: 'uppercase', lineHeight: 1.2 }}>
                                                    {tx.description}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ alignSelf: 'flex-end', pb: 0.5 }}>
                                                <FormatCurrency amount={tx.montant} />
                                            </Box>
                                        </Box>
                                    ))}
                                    {txs1.length === 0 && <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Aucune opération récente</Typography>}
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Grid>

                {/* Column 3: Account 2 Details */}
                <Grid item xs={12} md={4}>
                    {account2 && (
                        <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                            <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                                    {account2.type_compte === 'epargne' ? 'LIVRET BLEU' : 'COMPTE ' + account2.type_compte}
                                </Typography>
                                <MenuIcon sx={{ color: '#333' }} />
                            </Box>

                            <Box sx={{ bgcolor: '#FFFFFF', mt: 0.5 }}>
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#333' }}>
                                            M {user?.prenom} {user?.nom}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                            {account2.numero_compte}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ alignSelf: 'flex-end' }}>
                                        <FormatCurrency amount={account2.solde} />
                                    </Box>
                                </Box>

                                {/* Action Buttons underneath the balance */}
                                <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 2, borderBottom: '1px solid #E5E5E5' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => downloadRIB(account2)}
                                        startIcon={<PictureAsPdf />}
                                        sx={{ borderRadius: 0, textTransform: 'none', color: '#002B5E', borderColor: '#002B5E', '&:hover': { bgcolor: '#F4F4F4' } }}
                                    >
                                        Éditer RIB
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => openExportModal(account2)}
                                        startIcon={<InsertDriveFile />}
                                        sx={{ borderRadius: 0, textTransform: 'none', color: '#002B5E', borderColor: '#002B5E', '&:hover': { bgcolor: '#F4F4F4' } }}
                                    >
                                        Exporter CSV
                                    </Button>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigate('/virements')}
                                        endIcon={<ArrowForward />}
                                        sx={{ ml: 'auto', borderRadius: 0, textTransform: 'none', color: '#002B5E', fontWeight: 'bold', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                                    >
                                        Voir plus
                                    </Button>
                                </Box>

                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#002B5E', cursor: 'pointer', mb: 2 }}>
                                        Dernières opérations
                                    </Typography>

                                    {txs2.map((tx, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E5E5', pb: 1, mb: 1 }}>
                                            <Box sx={{ width: '70%' }}>
                                                <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                                                    {new Date(tx.date_transaction).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.85rem', textTransform: 'uppercase', lineHeight: 1.2 }}>
                                                    {tx.description}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ alignSelf: 'flex-end', pb: 0.5 }}>
                                                <FormatCurrency amount={tx.montant} />
                                            </Box>
                                        </Box>
                                    ))}
                                    {txs2.length === 0 && <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Aucune opération récente</Typography>}
                                </Box>
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* The side sticky buttons on the right side of the screen */}
            <Box sx={{ position: 'fixed', right: 0, top: '40%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Box sx={{ bgcolor: '#EAF0F6', p: 1.5, borderTopLeftRadius: '8px', borderRight: '1px solid #EAF0F6', borderBottom: '1px solid #D0DCE5', cursor: 'pointer' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#002B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 11.23V11.5C16 12.56 15.58 13.58 14.83 14.33C14.08 15.08 13.06 15.5 12 15.5L8 15.5" stroke="#002B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 13.5L8 15.5L10 17.5" stroke="#002B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 12V11C8 9.89543 8.89543 9 10 9H14C15.1046 9 16 9.89543 16 11V12" stroke="#002B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Box>
                <Box sx={{ bgcolor: '#EAF0F6', p: 1.5, borderBottomLeftRadius: '8px', cursor: 'pointer', borderTop: '1px solid white' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#002B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 12H8.01" stroke="#002B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 12H12.01" stroke="#002B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 12H16.01" stroke="#002B5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Box>
            </Box>

            {/* Export Dialog */}
            <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ bgcolor: '#002B5E', color: 'white', mb: 2 }}>Export de données</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 3 }}>Sélectionnez la période à exporter pour le compte {exportAccount?.type_compte}</Typography>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Année</InputLabel>
                        <Select value={exportYear} label="Année" onChange={(e) => setExportYear(e.target.value)}>
                            <MenuItem value="ALL">Depuis 3 ans (Toute l'historique)</MenuItem>
                            <MenuItem value="2026">2026</MenuItem>
                            <MenuItem value="2025">2025</MenuItem>
                            <MenuItem value="2024">2024</MenuItem>
                            <MenuItem value="2023">2023</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Mois</InputLabel>
                        <Select value={exportMonth} label="Mois" onChange={(e) => setExportMonth(e.target.value)} disabled={exportYear === 'ALL'}>
                            <MenuItem value="ALL">Tous les mois de l'année</MenuItem>
                            <MenuItem value="1">Janvier</MenuItem>
                            <MenuItem value="2">Février</MenuItem>
                            <MenuItem value="3">Mars</MenuItem>
                            <MenuItem value="4">Avril</MenuItem>
                            <MenuItem value="5">Mai</MenuItem>
                            <MenuItem value="6">Juin</MenuItem>
                            <MenuItem value="7">Juillet</MenuItem>
                            <MenuItem value="8">Août</MenuItem>
                            <MenuItem value="9">Septembre</MenuItem>
                            <MenuItem value="10">Octobre</MenuItem>
                            <MenuItem value="11">Novembre</MenuItem>
                            <MenuItem value="12">Décembre</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setExportOpen(false)} sx={{ color: '#666' }}>Annuler</Button>
                    <Button onClick={handleExportConfirm} variant="contained" sx={{ bgcolor: '#D3002D', '&:hover': { bgcolor: '#A00022' } }}>
                        Générer (.csv)
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

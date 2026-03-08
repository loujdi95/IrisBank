import { Box, Typography, Container, Paper } from '@mui/material';

export default function Raccourcis() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ textTransform: 'uppercase', color: '#333', mb: 0.5, fontSize: '1.4rem', fontWeight: 400 }}>
                    Vos Raccourcis
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ borderTop: '4px solid #F4F4F4', borderRadius: 0, bgcolor: 'transparent' }}>
                <Box sx={{ bgcolor: '#FFFFFF', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E5E5' }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#002B5E', textTransform: 'uppercase' }}>
                        Accès Directs
                    </Typography>
                </Box>

                <Box sx={{ bgcolor: '#FFFFFF', p: 4, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#666', fontSize: '1.1rem', textAlign: 'center' }}>
                        Personnalisez vos raccourcis depuis votre profil pour accéder rapidement à vos services favoris.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

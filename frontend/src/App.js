import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import ProjectList from './components/ProjectList';
import KanbanBoard from './components/KanbanBoard';
import FilterBar from './components/FilterBar';
import TeamMemberDialog from './components/TeamMemberDialog';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Header />
          
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar */}
            <Box
              sx={{
                width: 280,
                borderRight: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ProjectList />
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => setTeamDialogOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Manage Team
                </Button>
              </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Container maxWidth={false} sx={{ flex: 1, py: 3, overflow: 'auto' }}>
                <FilterBar />
                <KanbanBoard />
              </Container>
            </Box>
          </Box>

          <TeamMemberDialog
            open={teamDialogOpen}
            onClose={() => setTeamDialogOpen(false)}
          />
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;

import { Grid, Typography, Box, Paper } from "@mui/material";

import NotebookCard from "../../components/card/NoteBookCard";
import CreateNotebookCard from "../../components/card/CreateNotebook";

import type { Notebook } from "../../types/notebook";

import { useEffect, useState } from "react";

const HomePage = () => {
  const [notebooks, setNoteBooks] = useState<Notebook[]>([]);

  useEffect(() => {
    const fetchNotebooks = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notebook/get-all`,
        {
          credentials: "include",
        },
      );

      const resBody = await res.json();

      setNoteBooks(resBody?.data || []);
    };

    fetchNotebooks();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        px: {
          xs: 2,
          md: 5,
        },
        py: 5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          borderRadius: "28px",
          p: {
            xs: 3,
            md: 5,
          },
          border: "1px solid #e5e7eb",
          bgcolor: "white",
        }}
      >
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            Your AI Notebooks
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: "700px",
              lineHeight: 1.8,
            }}
          >
            Upload Information and chat with your personal AI assistant.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CreateNotebookCard />
          </Grid>

          {notebooks?.map((nb) => (
            <Grid key={nb._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <NotebookCard notebook={nb} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default HomePage;

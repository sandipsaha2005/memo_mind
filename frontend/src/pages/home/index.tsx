import { Grid, Typography, Box } from "@mui/material";
import NotebookCard from "../../components/card/NoteBookCard";
import CreateNotebookCard from "../../components/card/CreateNotebook";
import type { Notebook } from "../../types/notebook";
import { useEffect, useState } from "react";

const HomePage = () => {
  const [notebooks, setNoteBooks] = useState<Notebook[] | []>([]);

  useEffect(() => {
    const fetchNotebooks = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notebook/get-all`,
        { credentials: "include" },
      );
      const  resBody  = await res.json();
      setNoteBooks(resBody?.data)
    };

    fetchNotebooks();
  }, []);

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Welcome 👋
        </Typography>
        <Typography color="gray">
          Upload your documents, ask questions, and build your personal AI
          knowledge base.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={12}>
          <CreateNotebookCard />
        </Grid>
        {notebooks?.map((nb) => (
          <Grid key={nb._id} size={12}>
            <NotebookCard notebook={nb} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default HomePage;

import {
  Grid,
  Typography,
  Box,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import NotebookCard from "../../components/card/NoteBookCard";
import CreateNotebookCard from "../../components/card/CreateNotebook";

import type { Notebook } from "../../types/notebook";

import { useEffect, useMemo, useState } from "react";

const HomePage = () => {
  const [notebooks, setNoteBooks] = useState<Notebook[]>([]);

  const [search, setSearch] = useState("");

  const handleDeleteNoteBook = async (id: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notebook/delete/${id}`,
      {
        credentials: "include",
      },
    );

    const resBody = await res.json();
    const deleteNoteBookId = resBody?.data?._id;
    setNoteBooks(prev => prev.filter((n) => n._id !== deleteNoteBookId))
  }

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

  const filteredNotebooks = useMemo(() => {
    return notebooks.filter((nb) =>
      nb.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [notebooks, search]);

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        px: {
          xs: 1.5,
          sm: 2,
          md: 4,
        },
        py: {
          xs: 1.5,
          md: 3,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          maxWidth: "1400px",
          mx: "auto",
          borderRadius: {
            xs: "18px",
            md: "28px",
          },
          border: "1px solid #e5e7eb",
          bgcolor: "white",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              md: 5,
            },
            py: {
              xs: 2,
              md: 4,
            },
            borderBottom: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-1px",
              fontSize: {
                xs: "1.8rem",
                md: "2.3rem",
              },
            }}
          >
            Your AI Notebooks
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1,
              maxWidth: "700px",
              lineHeight: 1.7,
              fontSize: {
                xs: "0.95rem",
                md: "1rem",
              },
            }}
          >
            Upload information and chat with your personal AI assistant.
          </Typography>

          <TextField
            fullWidth
            placeholder="Search notebooks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              mt: 3,
              maxWidth: "500px",

              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                bgcolor: "#f8fafc",
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: "#94a3b8",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: {
              xs: 2,
              md: 5,
            },
            py: {
              xs: 2,
              md: 4,
            },

            "&::-webkit-scrollbar": {
              width: "6px",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#d1d5db",
              borderRadius: "20px",
            },
          }}
        >
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
                xl: 4,
              }}
            >
              <CreateNotebookCard />
            </Grid>

            {filteredNotebooks.map((nb) => (
              <Grid
                key={nb._id}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                  xl: 4,
                }}
              >
                <NotebookCard notebook={nb} deleteNotebook={handleDeleteNoteBook} />
              </Grid>
            ))}
          </Grid>

          {filteredNotebooks.length === 0 && (
            <Box
              sx={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No notebooks found
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Try searching with a different name
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;

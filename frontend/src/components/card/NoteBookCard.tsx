import { Card, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router";

import type { Notebook } from "../../types/notebook";

const NotebookCard = ({ notebook, deleteNotebook }: { notebook: Notebook, deleteNotebook: (id: string) => void }) => {
  const navigate = useNavigate();



  const formatDate = (dateString: string) => {

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,

    });
  };

  return (
    <Card

      sx={{
        cursor: "pointer",
        borderRadius: "24px",
        p: 3,
        height: "220px",
        border: "1px solid #e5e7eb",
        boxShadow: "none",
        transition: "0.25s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Box
        onClick={() => navigate(`/notebook/${notebook._id}`)}
        sx={{
          ":hover": {
            textDecoration: 'underline'
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",

          }}

        >
          {notebook.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
          }}
        >
          Your AI-powered notebook workspace
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: "flex", flexDirection: 'column' }}>
          <Typography variant="caption" color="text.secondary">
            Created at
          </Typography>

          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
            {formatDate(notebook.timestamp)}
          </Typography>
        </Box>

        <Button variant="outlined" color="error" onClick={() => deleteNotebook(notebook._id)}>Delete</Button>
      </Box>
    </Card>
  );
};

export default NotebookCard;

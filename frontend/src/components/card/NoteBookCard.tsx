import { Card, Typography, Box } from "@mui/material";

import { useNavigate } from "react-router";

import type { Notebook } from "../../types/notebook";

const NotebookCard = ({ notebook }: { notebook: Notebook }) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/notebook/${notebook._id}`)}
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
      <Box>
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

      <Box>
        <Typography variant="caption" color="text.secondary">
          Created at
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
          {notebook.timestamp}
        </Typography>
      </Box>
    </Card>
  );
};

export default NotebookCard;

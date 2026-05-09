import { Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import type { Notebook } from "../../types/notebook";

const NotebookCard = ({ notebook }: { notebook: Notebook }) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/notebook/${notebook._id}`)}
      sx={{ cursor: "pointer" }}
    >
      <CardContent>
        <Typography variant="h6">{notebook.name}</Typography>
        <Typography variant="body2" color="gray">
          {notebook.timestamp}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NotebookCard;
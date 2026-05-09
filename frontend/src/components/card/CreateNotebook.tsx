import {
  Card,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router";

const DialogComponent = ({
  open,
  handleClose,
  setOpen,
}: {
  open: boolean;
  handleClose: () => void;
  setOpen: (x: boolean) => void;
}) => {
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) return;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notebook/create`,
      {
        credentials: "include",
        method: "POST",
        body: JSON.stringify({ name }),
      },
    );

    const resBody = await res.json();

    if (resBody.success) {
      setOpen(false);

      navigate(`/notebook/${resBody.data}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      // PaperProps={{
      //   sx: {
      //     borderRadius: "24px",
      //     p: 1,
      //   },
      // }}
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Create Notebook
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Give your notebook a meaningful name
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            placeholder="Machine Learning Notes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            px: 2.5,
            boxShadow: "none",
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateNotebookCard = () => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        sx={{
          cursor: "pointer",
          height: "220px",
          borderRadius: "24px",
          border: "2px dashed #cbd5e1",
          bgcolor: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "0.25s ease",
          boxShadow: "none",

          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: "#111827",
            bgcolor: "white",
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "52px",
              lineHeight: 1,
              mb: 1,
              fontWeight: 200,
            }}
          >
            +
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create Notebook
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start building your AI workspace
          </Typography>
        </Box>
      </Card>

      <DialogComponent
        open={open}
        handleClose={handleClose}
        setOpen={setOpen}
      />
    </>
  );
};

export default CreateNotebookCard;

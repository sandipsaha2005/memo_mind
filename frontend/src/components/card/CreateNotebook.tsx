import {
  Card,
  CardContent,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";

const DialogComponent = ({
  open,
  handleClose,
  setOpen
}: {
  open: boolean;
  handleClose: () => void;
  setOpen: (x: boolean) => void
}) => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notebook/create`,
      {
        credentials: 'include', method: "POST", body: JSON.stringify({ name })
      }
    )

    const resBody = await res.json();
    if (resBody.success) {
      setOpen(false)
      navigate(`/notebook/${resBody.data}`)
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{ width: "80%", padding: '20px' }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      role="alertdialog"
    >
      <DialogTitle id="alert-dialog-title">
        {"Enter Name for you notebook"}
      </DialogTitle>
      <DialogContent>
        <TextField
          id="outlined-basic"
          label="Name"
          variant="outlined"
          value={name}
          fullWidth
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
        <Button onClick={handleClose} color="error" variant="contained">
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          autoFocus
          color="success"
          variant="contained"
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
        sx={{ cursor: "pointer", border: "2px dashed gray" }}
      >
        <CardContent>
          <Typography variant="h6">+ Create Notebook</Typography>
        </CardContent>
      </Card>
      <DialogComponent open={open} handleClose={handleClose} setOpen={setOpen} />
    </>
  );
};

export default CreateNotebookCard;

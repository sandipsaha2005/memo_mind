import { Box, Button, Dialog, TextField } from "@mui/material";

interface Props {
  onSubmit: (text: string, file?: File) => void;
  open: boolean,
  handleClose: () => void;
}

const UploadForm = ({ onSubmit, open, handleClose }: Props) => {
  
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("text") as string;
    const file = formData.get("file") as File;
    onSubmit(text, file);
  };

  return (
    <Dialog open={open} onClose={handleClose} sx={{ width: "80%", padding: '20px' }}>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          name="text"
          label="Paste your content"
          multiline
          rows={4}
          fullWidth
          margin="normal"
        />
        <Button variant="outlined" component="label">
          Upload PDF
          <input type="file" name="file" hidden />
        </Button>
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained">
            Create Notebook
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default UploadForm;
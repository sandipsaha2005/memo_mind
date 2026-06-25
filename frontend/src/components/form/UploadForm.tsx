import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

interface Props {
  onSubmit: (text: string, file?: File, sourceName?: string) => void;
  open: boolean;
  handleClose: () => void;
}

const UploadForm = ({ onSubmit, open, handleClose }: Props) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const text = formData.get("text") as string;
    const fileEntry = formData.get("file") as File;
    const file = fileEntry.size > 0 ? fileEntry : null;
    const sourceName = (formData.get("sourceName") as string)?.trim();
    onSubmit(text, file, sourceName);
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Create Notebook
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Upload your PDF or paste content to begin chatting
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 1,
          }}
        >
          <TextField
            name="sourceName"
            label="Source name (optional)"
            fullWidth
            placeholder="e.g. Lecture notes, Chapter 1..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          />

          <TextField
            name="text"
            label="Paste content"
            multiline
            rows={6}
            fullWidth
            placeholder="Paste your notes, article, or documentation..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          />

          <Box>
            <Button
              variant="outlined"
              component="label"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                px: 3,
                py: 1.2,
              }}
            >
              Upload File
              <input type="file" name="file" hidden accept=".txt" />
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "14px",
              py: 1.4,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Create Notebook
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UploadForm;

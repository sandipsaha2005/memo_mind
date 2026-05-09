import { Box, Typography } from "@mui/material";
import type { Message } from "../../types/notebook";

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.type === "query";
  
  return (
    <Box
      sx={{ mb: 2, display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}

    >
      <Box
        sx={{
          bgcolor: isUser ? "primary.main" : "grey.300",
          color: isUser ? "white" : "black",
          px: 2, py: 1,
          borderRadius: 2,
          maxWidth: "70%"
        }}

      >
        <Typography variant="body2">{message.content}</Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
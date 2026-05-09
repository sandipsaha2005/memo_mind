import { Box, Typography } from "@mui/material";
import type { Message } from "../../types/notebook";

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.type === "query";

  return (
    <Box
      sx={{
        mb: 2.5,
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: "18px",
          maxWidth: "75%",
          bgcolor: isUser ? "#111827" : "white",
          color: isUser ? "white" : "#111827",
          border: isUser ? "none" : "1px solid #e5e7eb",
          boxShadow: isUser ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {message.content}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;

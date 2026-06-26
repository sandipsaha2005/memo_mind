import { Box, CircularProgress, Typography } from "@mui/material";
import type { Message } from "../../types/notebook";

const ChatMessage = ({
  message,
  loading = false,
}: {
  message: Message;
  loading?: boolean;
}) => {
  const isUser = message.type === "query";
  const showThinking = loading && !message.content;

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
        {showThinking ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
              animation: "pulse 1.6s ease-in-out infinite",
            }}
          >
            <CircularProgress size={12} thickness={5} sx={{ color: "#6b7280" }} />
            <Typography
              variant="body2"
              sx={{ color: "#6b7280", fontStyle: "italic" }}
            >
              Analyzing...
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;

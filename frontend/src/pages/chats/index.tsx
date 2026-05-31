import { useRef, useLayoutEffect, useEffect, useState } from "react";
import { useParams } from "react-router";

import { Box, TextField, Button, Paper, Typography } from "@mui/material";

import ChatMessage from "../../components/chat/Message";
import UploadForm from "../../components/form/UploadForm";

import type { Message } from "../../types/notebook";

const ChatPage = () => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();

  const [chatState, setChatState] = useState<{
    messages: Message[];
    uploadOpen: boolean;
  }>({
    messages: [],
    uploadOpen: false,
  });

  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const query = input;
    setInput("");

    setChatState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { content: query, type: "query" },
        { content: "", type: "response" },
      ],
    }));

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/retrieve`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query, notebookId: id }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const events = text.split("\n\n").filter(Boolean);

      for (const event of events) {
        const lines = event.split("\n");
        const eventType = lines.find((l) => l.startsWith("event: "))?.slice(7);
        const data = lines.find((l) => l.startsWith("data: "))?.slice(6);

        if (eventType === "content" && data) {
          setChatState((prev) => {
            const msgs = [...prev.messages];
            const last = msgs[msgs.length - 1];
            msgs[msgs.length - 1] = { ...last, content: last.content + data };
            return { ...prev, messages: msgs };
          });
        }
      }
    }
  };

  const handleClose = () => {
    setChatState((prev) => ({
      ...prev,
      uploadOpen: false,
    }));
  };

  const handleCreate = async (text: string, file?: File) => {
    const formData = new FormData();

    formData.append("text", text);
    formData.append("notebookId", id!);

    if (file) {
      formData.append("file", file);
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ingest`, {
      credentials: "include",
      method: "POST",
      body: formData,
    });

    const resBody = await res.json();

    if (resBody.success) {
      handleClose();
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notebook/get/${id}`,
        {
          credentials: "include",
        },
      );

      const resBody = await res.json();

      setChatState({
        messages: resBody?.data?.interactions || [],
        uploadOpen: !resBody?.initialIngestDone,
      });
    };

    fetchChats();
  }, [id]);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatState.messages]);

  return (
    <>
      <UploadForm
        open={chatState.uploadOpen}
        handleClose={handleClose}
        onSubmit={handleCreate}
      />

      <Box
        sx={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",

          px: 2,
          py: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            flexDirection: "column",
            borderRadius: "24px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            bgcolor: "white",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid #eee",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              AI Notebook
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Ask questions from your uploaded content
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 3,
              py: 3,
              bgcolor: "#fafafa",
            }}
          >
            {chatState.messages.length === 0 && (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Start a conversation
                </Typography>

                <Typography color="text.secondary">
                  Ask anything about your notebook
                </Typography>
              </Box>
            )}

            {chatState.messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            <div ref={bottomRef} />
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #eee",
              bgcolor: "white",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <TextField
                fullWidth
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#f9fafb",
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleSend}
                sx={{
                  borderRadius: "14px",
                  px: 3,
                  height: "56px",
                  textTransform: "none",
                  boxShadow: "none",
                }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ChatPage;

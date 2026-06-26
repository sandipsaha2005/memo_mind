import { useRef, useLayoutEffect, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Box, TextField, Button, Paper, Typography } from "@mui/material";

import ChatMessage from "../../components/chat/Message";
import UploadForm from "../../components/form/UploadForm";
import SourcesPanel from "../../components/card/SourcesPanel";
import { apiFetch } from "../../utils/apiFetch";
import { useNotebook, useIngestSource } from "../../api/notebooks";
import type { Message, Source } from "../../types/notebook";

const ChatPage = () => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();
  const notebookId = id ?? "";

  const { data: notebook } = useNotebook(notebookId);
  const ingest = useIngestSource(notebookId);

  const sources = notebook?.sources ?? [];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const seededRef = useRef<string | undefined>(undefined);

  const renderStream = async (
    stream: ReadableStream<Uint8Array<ArrayBuffer>>,
  ) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let firstChunk = true;

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
          if (firstChunk) {
            setIsLoading(false);
            firstChunk = false;
          }
          setMessages((prev) => {
            const msgs = [...prev];
            const last = msgs[msgs.length - 1];
            msgs[msgs.length - 1] = { ...last, content: last.content + data };
            return msgs;
          });
        }
      }
    }

    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const query = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { content: query, type: "query" },
      { content: "", type: "response" },
    ]);

    setIsLoading(true);

    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/retrieve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query, notebookId: id }),
    });

    renderStream(res.body!);
  };

  const handleClose = () => setUploadOpen(false);

  const handleOpenUpload = () => setUploadOpen(true);

  const handleToggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const handleCreate = (text: string, file?: File, sourceName?: string) => {
    const sourceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let resolvedName: string;
    if (file) {
      resolvedName = sourceName || file.name;
    } else {
      const textCount = sources.filter((s) => s.type === "text").length;
      resolvedName = sourceName || `Text ${textCount + 1}`;
    }

    const optimisticSource: Source = {
      id: sourceId,
      name: resolvedName,
      type: file ? "file" : "text",
      pending: true,
    };

    const formData = new FormData();
    formData.append("text", text);
    formData.append("notebookId", id!);
    formData.append("sourceName", resolvedName);

    if (file) {
      formData.append("file", file);
    }

    setUploadOpen(false);
    ingest.mutate({ formData, optimisticSource });
  };

  useEffect(() => {
    if (notebook && seededRef.current !== id) {
      setMessages(notebook.interactions);
      setUploadOpen(!notebook.initialIngestDone);
      seededRef.current = id;
    }
  }, [notebook, id]);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <>
      <UploadForm
        open={uploadOpen}
        handleClose={handleClose}
        onSubmit={handleCreate}
      />

      <Box
        sx={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          gap: 2,

          px: 2,
          py: 3,
        }}
      >
        <SourcesPanel
          sources={sources}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onAdd={handleOpenUpload}
        />

        <Paper
          elevation={0}
          sx={{
            flex: 1,
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
            {messages.length === 0 && (
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

            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                loading={
                  isLoading &&
                  i === messages.length - 1 &&
                  msg.type === "response"
                }
              />
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

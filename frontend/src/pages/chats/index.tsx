import { useRef, useLayoutEffect, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Box, TextField, Button, Paper, Typography } from "@mui/material";

import ChatMessage from "../../components/chat/Message";
import UploadForm from "../../components/form/UploadForm";
import SourcesPanel from "../../components/card/SourcesPanel";
import { apiFetch } from "../../utils/apiFetch";
import type { Message, Source } from "../../types/notebook";

const ChatPage = () => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();

  const [chatState, setChatState] = useState<{
    messages: Message[];
    uploadOpen: boolean;
    sources: Source[];
    sidebarCollapsed: boolean;
  }>({
    messages: [],
    uploadOpen: false,
    sources: [],
    sidebarCollapsed: false,
  });

  const [input, setInput] = useState("");

  const renderStream = async (
    stream: ReadableStream<Uint8Array<ArrayBuffer>>,
  ) => {
    const reader = stream.getReader();
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

    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/retrieve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query, notebookId: id }),
    });

    renderStream(res.body!);
  };

  const handleClose = () => {
    setChatState((prev) => ({
      ...prev,
      uploadOpen: false,
    }));
  };

  const handleOpenUpload = () => {
    setChatState((prev) => ({
      ...prev,
      uploadOpen: true,
    }));
  };

  const handleToggleSidebar = () => {
    setChatState((prev) => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
  };

  const handleCreate = async (
    text: string,
    file?: File,
    sourceName?: string,
  ) => {
    const sourceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let resolvedName: string;
    if (file) {
      resolvedName = sourceName || file.name;
    } else {
      const textCount = chatState.sources.filter(
        (s) => s.type === "text",
      ).length;
      resolvedName = sourceName || `Text ${textCount + 1}`;
    }

    const optimisticSource: Source = {
      id: sourceId,
      name: resolvedName,
      type: file ? "file" : "text",
      pending: true,
    };

    setChatState((prev) => ({
      ...prev,
      uploadOpen: false,
      sources: [...prev.sources, optimisticSource],
    }));

    const formData = new FormData();

    formData.append("text", text);
    formData.append("notebookId", id!);
    formData.append("sourceName", resolvedName);

    if (file) {
      console.log("file present", file);

      formData.append("file", file);
    }

    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/ingest`, {
        method: "POST",
        body: formData,
      });

      const resBody = await res.json();

      if (resBody.success) {
        setChatState((prev) => ({
          ...prev,
          sources: prev.sources.map((s) =>
            s.id === sourceId ? { ...s, pending: false } : s,
          ),
        }));
      } else {
        throw new Error(resBody.message || "Ingest failed");
      }
    } catch {
      setChatState((prev) => ({
        ...prev,
        sources: prev.sources.filter((s) => s.id !== sourceId),
      }));
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      const res = await apiFetch(
        `${import.meta.env.VITE_API_URL}/api/notebook/get/${id}`,
      );

      const resBody = await res.json();

      const sources: Source[] = (resBody?.data?.sources || []).map(
        (s: { name: string; type: "file" | "text" }, i: number) => ({
          id: `${i}-${s.name}`,
          name: s.name,
          type: s.type,
        }),
      );

      setChatState({
        messages: resBody?.data?.interactions || [],
        uploadOpen: !resBody?.data?.initialIngestDone,
        sources,
        sidebarCollapsed: false,
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
          gap: 2,

          px: 2,
          py: 3,
        }}
      >
        <SourcesPanel
          sources={chatState.sources}
          collapsed={chatState.sidebarCollapsed}
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

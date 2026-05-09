import { useRef, useLayoutEffect } from "react";

import { useParams } from "react-router";
import { Box, TextField, Button } from "@mui/material";
import ChatMessage from "../../components/chat/Message";
import { useEffect, useState } from "react";
import type { Message } from "../../types/notebook";
import UploadForm from "../../components/form/UploadForm";

const ChatPage = () => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();
  const [chatState, setChatState] = useState<{ messages: Message[]; uploadOpen: boolean }>({
    messages: [],
    uploadOpen: false,
  });


  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input) return;
    setInput("");

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, { content: input, type: "query" }],
    }));

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/retrieve`, {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ text: input, notebookId: id }),
    });

    const resBody = await res.json();

    if (resBody) {
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, { content: resBody.content, type: "response" }]
      }));
    }

  };

  const handleClose = () => {
    setChatState((prev) => ({
      ...prev,
      uploadOpen: false
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
        { credentials: "include" }
      );

      const resBody = await res.json();

      setChatState({
        messages: resBody?.data?.interactions,
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

      <Box sx={{ height: "60vh", overflow: "auto", mb: 2 }}>
        {chatState?.messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </>
  );
};

export default ChatPage;

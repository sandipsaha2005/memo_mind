import { BrowserRouter, Route, Routes } from "react-router";
import HomePage from "./pages/home";
import ChatPage from "./pages/chats";
import CreateNoteBook from "./pages/setup_notebook";
import Layout from "./layout/Layout";
import LoginPage from "./pages/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/notebook/:id" element={<ChatPage />} />
          <Route path="/create-notebook" element={<CreateNoteBook />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

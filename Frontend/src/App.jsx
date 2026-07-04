import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";
import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";

// The main chat application, wrapped in ProtectedRoute
function MainChatApp() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); // stores all chats of curr threads
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,
    isSidebarOpen,
    setIsSidebarOpen,
  };

  return (
    <div className="app">
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainChatApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

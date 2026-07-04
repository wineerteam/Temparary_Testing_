import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { useAuth } from "./auth/AuthProvider.jsx";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, isSidebarOpen, setIsSidebarOpen } = useContext(MyContext);
    const { logout, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    const getReply = async () => {
        setLoading(true);
        setNewChat(false);

        console.log("message ", prompt, " threadId ", currThreadId);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }

    //Append new chat to prevChats
    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                }, {
                    role: "assistant",
                    content: reply
                }]
            ));
        }

        setPrompt("");
    }, [reply]);


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navbar-left">
                    <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span>SkyGPT <i className="fa-solid fa-chevron-down"></i></span>
                </div>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                        <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                    )}
                </div>
            </div>
            {
                isOpen &&
                <div className="dropDown">
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "12px", color: "#a0aec0", wordBreak: "break-all" }}>
                        Signed in as <strong style={{ color: "#fff" }}>{user?.username || user?.email}</strong>
                    </div>
                    <div className="dropDownItem" onClick={() => { alert('Settings: Feature coming soon!'); setIsOpen(false); }}><i className="fa-solid fa-gear"></i> Settings</div>
                    <div className="dropDownItem" onClick={() => { alert('Upgrade Plan: Feature coming soon!'); setIsOpen(false); }}><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className="dropDownItem" onClick={async () => { await logout(); setIsOpen(false); }}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                </div>
            }
            <Chat></Chat>

            <ScaleLoader color="#fff" loading={loading}>
            </ScaleLoader>

            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                    >

                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    SkyGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;
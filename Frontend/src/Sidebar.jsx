import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, isSidebarOpen, setIsSidebarOpen } = useContext(MyContext);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    const getAllThreads = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread`, {
                credentials: "include"
            });
            const res = await response.json();
            if (Array.isArray(res)) {
                const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
                setAllThreads(filteredData);
            } else {
                console.error("Failed to fetch threads:", res.error);
                setAllThreads([]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId])


    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setIsSidebarOpen(false);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        setIsSidebarOpen(false);

        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${newThreadId}`, {
                credentials: "include"
            });
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    }

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {
                method: "DELETE",
                credentials: "include"
            });
            const res = await response.json();
            console.log(res);

            //updated threads re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if (threadId === currThreadId) {
                createNewChat();
            }

        } catch (err) {
            console.log(err);
        }
    }

    return (
        <>
            <div className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`} onClick={() => setIsSidebarOpen(false)}></div>
            <section className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <div className="sidebar-mobile-header">
                    <span className="sidebar-mobile-title">Chat History</span>
                    <button className="sidebar-mobile-close" onClick={() => setIsSidebarOpen(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <button onClick={createNewChat}>
                    <img src="/blacklogo.png" alt="gpt logo" className="logo"></img>
                    <span><i className="fa-solid fa-pen-to-square"></i></span>
                </button>


                <ul className="history">
                    {
                        allThreads?.map((thread, idx) => (
                            <li key={idx}
                                onClick={(e) => changeThread(thread.threadId)}
                                className={thread.threadId === currThreadId ? "highlighted" : " "}
                            >
                                {thread.title}
                                <i className="fa-solid fa-trash"
                                    onClick={(e) => {
                                        e.stopPropagation(); //stop event bubbling
                                        deleteThread(thread.threadId);
                                    }}
                                ></i>
                            </li>
                        ))
                    }
                </ul>

                <div className="sign">
                    <p>By CodeHuner_SKY &hearts;</p>
                </div>
            </section>
        </>
    )
}

export default Sidebar;
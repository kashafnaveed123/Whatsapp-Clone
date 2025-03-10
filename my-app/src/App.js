import React, { useState } from "react";
import { FaPaperPlane, FaHistory, FaTimes, FaBars } from "react-icons/fa";
import { RiChatHistoryFill } from "react-icons/ri";
import { SiReactos } from "react-icons/si";

import { motion } from "framer-motion";
import axios from "axios";
export default function App() {
  const [messages, setMessages] = useState([
    { prompt: "Hello! How can I assist you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { prompt: input, sender: "user" };
    setMessages([...messages, userMessage]);
    setHistory([...history, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        prompt: input,
      });
      if (res.data && res.data.response) {
        const botResponse = { prompt: res.data.response, sender: "bot" };
        setTimeout(() => {
          setMessages((prev) => [...prev, botResponse]);
          setHistory((prev) => [...prev, botResponse]);
          setIsTyping(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      {/* Toggle Button */}
      <button
        className="absolute top-4 left-4 p-2 bg-gray-700 text-white rounded-lg z-[100]"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>
      {/* Sidebar */}
   {isSidebarOpen ? 
      <div
        className={`fixed md:relative w-64 h-full bg-gray-200 border border-gray-300
  text-gray-800 rounded-lg p-4 space-y-4 transition-all duration-300
  ${isSidebarOpen ? "left-0" : "-left-72"} md:${
          isSidebarOpen ? "left-0" : "-left-72"
        } font-sans`}
      >
        <h2 className="text-base font-semibold flex text-center items-center mt-10">
          <FaHistory className="mr-2" /> Chat History
        </h2>
        <div className="space-y-2 overflow-y-auto h-full ">
          {history
            .filter((msg) => msg.sender === "user")
            .map((msg, index) => (
              <div
                key={index}
                className="p-3 text-sm rounded-2xl border border-gray-400 shadow-lg cursor-pointer 
  hover:bg-gray-300 transition duration-300 flex items-center"
              >
                <RiChatHistoryFill className="mr-2 text-gray-700" />{" "}
                {msg.prompt}
              </div>
            ))}
        </div>
      </div> : ' '
   }

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col ">
      
        {/* Header */}
        <div className=" bg-gray-200 border border-gray-300 text-gray-700 text-center py-8  text-2xl font-medium">
          <div className="flex justify-center">
            <SiReactos className="m-1" />
            𝐂𝐡𝐚𝐭𝐛𝐨𝐭
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-x-hidden p-4 space-y-3">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`p-4 rounded-2xl shadow-md ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-[#9c9d9ed8] to-[#c5c7cae1] text-white ml-auto max-w-xs"
                  : "bg-gradient-to-r from-gray-300 to-gray-200 text-gray-900 max-w-2xl"
              }`}
            >
              {msg.prompt}
            </motion.div>
          ))}
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="p-3 rounded-lg bg-gray-400 text-white w-20 flex space-x-2 ml-2"
            >
              <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
            </motion.div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white dark:bg-gray-800 flex items-center justify-center border-t">
          <input
            type="text"
            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white max-w-2xl"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="ml-2 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600  transition-all duration-300"
          >
            <FaPaperPlane />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { RiWhatsappFill } from "react-icons/ri";
import { motion } from "framer-motion";
import io from "socket.io-client";
import ting from './ting.mp3'
const socket = io("http://localhost:5000");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userName, setUserName] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const name = prompt("Enter your name");
    setUserName(name);
    socket.emit("newUserJoined", name);
    console.log(name);

    socket.on("User joined", ({ name }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { prompt: `${name} joined the chat`, sender: "bot" },
      ]);
    });
    socket.on("message sent", ({ msg, user }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          prompt: (
            <>
              <span className='text-green-500 font-bold'>
              {user === name ? "You" : user} 
              </span>
              : {msg} 
            </>
          ),

          sender: user,
        },
      ]);
    });
    socket.on("user disconnected", ({ name }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { prompt: `${name} left the chat`, sender: "bot" },
      ]);
    });
    socket.on("play-audio", () => {
      const audio = new Audio(ting);
      audio.play().catch(() => {
        
        document.addEventListener("click", () => {
          audio.play();
        }, { once: true }); 
      });
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    socket.emit("send", input, userName);
    socket.emit("play-audio");
    setInput("");
  };

  return (
    <div
      className="flex h-screen  bg-gray-100 dark:bg-gray-900 font-sans  "
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')",
      }}
    >
      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col ">
        {/* Header */}
        <div className=" bg-white text-gray-700 text-center py-5  text-2xl font-medium">
          <div className="flex justify-center">
            <RiWhatsappFill className="m-1 text-[#25D366]" size={30} />
            Welcome to IChat.com
          </div>
        </div>

        {/* Chat Area */}
        <div
          className="flex-1 overflow-y-auto overflow-hidden p-4 space-y-3"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`p-4 rounded-lg text-base font-sans  ${
                msg.sender === "bot"
                  ? "bg-gray-500 text-white text-center mx-auto max-w-md"
                  : msg.sender === userName
                  ? "bg-[#D9FDD3] ml-auto max-w-xs"
                  : "bg-white max-w-2xl"
              }`}
            >
              {msg.prompt}
            </motion.div>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-gray-200  dark:bg-gray-800 flex items-center justify-center border-t">
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

import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { FaUserCircle } from "react-icons/fa";
import "./PcosBot.css";

export default function PcosBot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm Swastha, your PeeCeeSakhi here to help you. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const botPreparingMessage = { sender: "bot", text: "Preparing your answer..." };

    // Add user message and preparing message
    setMessages((prev) => [...prev, userMessage, botPreparingMessage]);

    // Clear input immediately
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/pcos-bot", {
        message: userMessage.text,
      });

      // Replace "Preparing your answer..." with bot reply
      setMessages((prev) => {
        const messagesWithoutPreparing = prev.slice(0, -1); // remove last message
        return [...messagesWithoutPreparing, { sender: "bot", text: res.data.reply }];
      });
    } catch (err) {
      setMessages((prev) => {
        const messagesWithoutPreparing = prev.slice(0, -1);
        return [...messagesWithoutPreparing, { sender: "bot", text: "Error connecting to server." }];
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <img src="/images/Assistent.jpg" alt="Bot" className="bot-avatar" />
        <img src="/images/App_logo.jpg" alt="Bot" className="app-logo" />
      </div>

      {/* Messages */}
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.sender}`}>
            {msg.sender === "bot" && (
              <img src="/images/AI_Assistent.jpg" alt="Bot" className="avatar" />
            )}

            <div className={`message ${msg.sender}`}>
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="avatar user-avatar">
                <FaUserCircle size={32} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="input-box">
        <input
          type="text"
          placeholder="Send message.."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading}>
          ➤
        </button>
      </div>
    </div>
  );
}

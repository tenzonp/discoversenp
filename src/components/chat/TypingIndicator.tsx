const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-message-in">
      <div className="chat-bubble-assistant flex items-center gap-1 py-4 px-5">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;

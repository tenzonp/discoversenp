const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="thought-other flex items-center gap-1.5 py-3">
        <div className="thinking-dot" />
        <div className="thinking-dot" />
        <div className="thinking-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;

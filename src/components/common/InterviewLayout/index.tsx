import React from "react";

interface InterviewLayoutProps {
  children: React.ReactNode;
}

const InterviewLayout: React.FC<InterviewLayoutProps> = ({ children }) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

export default InterviewLayout;

import InterviewLayout from "@/components/common/InterviewLayout";
import React from "react";

interface InterviewRouteProps {
  children: React.ReactNode;
}

const InterviewRoute: React.FC<InterviewRouteProps> = ({ children }) => {
  return <InterviewLayout>{children}</InterviewLayout>;
};

export default InterviewRoute;

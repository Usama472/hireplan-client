import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Register: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to contact page instead of showing signup form
    navigate("/contact");
  }, [navigate]);

  return null;
};

export default Register;

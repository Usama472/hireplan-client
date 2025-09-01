import type { FC } from "react";
import { LoginLayout } from "@/components/common/LoginLayout";
import { LoginForm } from "@/components/forms/LoginForm";

const Login: FC = () => (
  <LoginLayout>
    <LoginForm />
  </LoginLayout>
);

export default Login;

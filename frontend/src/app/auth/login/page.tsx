"use client";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm, type AuthFormValues } from "~/_components/auth/auth-form";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "~/validation/auth/auth-validation";
import { Alert, AlertDescription, AlertTitle } from "~/_components/ui/alert";
import { CircleX } from "lucide-react";

const ERROR_MESSAGES = {
  UserExists: "User already exists. Please try again.",
  RegisterFailed: "Registration failed. Please try again.",
  LoginFailed: "Login failed. Please try again.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const error = searchParams.get("code");

  const methods = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });

  async function onSubmit(data: AuthFormValues) {
    try {
      await signIn("credentials", {
        ...data,
        action: "login",
        redirectTo: redirectUrl,
        redirect: true,
      });
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {error && (
        <Alert
          variant={"destructive"}
          className="bg-background/20 mb-5 w-full max-w-sm backdrop-blur-lg md:max-w-3xl"
        >
          <CircleX className="h-4 w-4" />
          <AlertTitle>
            {ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES]}
          </AlertTitle>
          <AlertDescription>
            Please check your credentials and try again.
          </AlertDescription>
        </Alert>
      )}
      <div className="w-full max-w-sm md:max-w-3xl">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <AuthForm
              title="Welcome back!"
              subTitle="Login to your account"
              buttonText="Login"
              isLogin
              onSubmit={methods.handleSubmit(onSubmit)}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

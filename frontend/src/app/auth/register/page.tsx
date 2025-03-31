"use client";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm, type AuthFormValues } from "~/_components/auth/auth-form";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "~/validation/auth/auth-validation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

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
        action: "register",
        redirectTo: redirectUrl,
        redirect: true,
      });
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <AuthForm
              title="Register"
              subTitle="Create a new account"
              buttonText="Register"
              onSubmit={methods.handleSubmit(onSubmit)}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

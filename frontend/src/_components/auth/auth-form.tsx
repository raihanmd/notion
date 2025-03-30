"use client";
import { cn } from "~/lib/utils";
import { Button } from "~/_components/ui/button";
import { Card, CardContent } from "~/_components/ui/card";
import { Input } from "~/_components/ui/input";
import { Label } from "~/_components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";
import type { authSchema } from "~/validation/auth/auth-validation";

export type AuthFormValues = z.infer<typeof authSchema>;

type Props = {
  title: string;
  subTitle: string;
  buttonText: string;
  isLogin?: boolean;
};

export function AuthForm({
  className,
  buttonText,
  title,
  subTitle,
  isLogin,
  ...props
}: Props & React.ComponentPropsWithoutRef<"div">) {
  const {
    formState: { isLoading, errors },
    register,
  } = useFormContext<AuthFormValues>();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-12 md:grid-cols-2">
          <div className="md:p-10 md:pl-0">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground text-balance">{subTitle}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username" className="pb-1">
                  Username
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  type="text"
                  placeholder="username"
                />
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="pb-1">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  {...register("password")}
                  type="password"
                  placeholder="password"
                />
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {buttonText}
              </Button>
              {isLogin ? (
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="underline underline-offset-4"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="bg-muted relative hidden overflow-hidden rounded-lg md:block">
            <Image
              src="https://images.unsplash.com/photo-1527656855834-0235e41779fd?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              width={500}
              height={500}
              priority
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

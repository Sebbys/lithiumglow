"use server";
import { auth } from "@/lib/auth";
import { error } from "console";

export const SignIn = async (email: string, password: string) => {
  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
};

export const SignUp = async (email: string, password: string, name: string) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        role: "guest",
      },
    });
  } catch {
    error("Error signing up");
  }
};
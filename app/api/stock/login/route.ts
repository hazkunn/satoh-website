import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, verifyPassword, SESSION_COOKIE, SESSION_DURATION } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, operatorName } = body;

    if (!password || !operatorName) {
      return NextResponse.json(
        { error: "パスワードと担当者名は必須です" },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(operatorName);

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    );
  }
}
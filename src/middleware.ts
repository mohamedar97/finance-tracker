import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./server/auth";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|privacy|knowledge-base|pricing|contact|privacy|favicon.ico|logo.svg|google-icon.svg|.*\\.(?:png|jpg|avif|jpeg|gif|webp|svg)).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const session = await auth();

  const isLoginPage = url.pathname.includes("/login");
  const isRegisterPage = url.pathname.includes("/register");

  const destinationUrl = url.href.replace(url.origin, "");
  if (
    (!session || !session?.user || !session.user.email) &&
    !isLoginPage &&
    !isRegisterPage
  ) {
    return NextResponse.redirect(
      new URL(`/login?next=${destinationUrl}`, request.url),
    );
  }

  if (session && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

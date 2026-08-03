"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSocialIcon from "@/components/FloatingSocialIcon";
import AiWidget from "@/components/AiWidget/AiWidget";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide all chrome on stock-app routes
  if (pathname.startsWith("/stock-app")) {
    return <>{children}</>;
  }

  return (
    <>
      <FloatingSocialIcon />
      <AiWidget />
      <Header />
      {children}
      <Footer />
    </>
  );
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoWorkspace from "@/components/DemoWorkspace";

export const metadata: Metadata = {
  title: "Demos locales",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DemoWorkspace />;
}

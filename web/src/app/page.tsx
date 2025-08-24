"use client";

import dynamic from "next/dynamic";

const ClientMap = dynamic(() => import("@/components/Map/ClientMap"), {
  ssr: false,
});

export default function Home() {
  return <ClientMap />;
}

"use client";

import dynamic from "next/dynamic";

const ClientMap = dynamic(() => import("@/components/Map/ClientMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      Loading application...
    </div>
  ),
});

export default function Home() {
  return <ClientMap />;
}

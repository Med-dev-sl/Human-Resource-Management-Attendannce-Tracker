"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/components/Loading";
import Login from "@/app/components/Login";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLogin(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <div
        className={`transition-opacity duration-700 ${
          showLogin ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Loading />
      </div>
      <div
        className={`transition-opacity duration-700 ${
          showLogin ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Login />
      </div>
    </div>
  );
}

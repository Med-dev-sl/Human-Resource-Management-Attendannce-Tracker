import Image from "next/image";

export default function Loading({ className }: { className?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl animate-ping" />
        <Image
          src="/etusl.png"
          alt="Loading..."
          width={140}
          height={48}
          className={`relative animate-pulse ${className ?? ""}`}
          priority
        />
      </div>
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

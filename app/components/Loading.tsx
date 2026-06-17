import Image from "next/image";

export default function Loading({ className }: { className?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <Image
        src="/etusl.png"
        alt="Loading..."
        width={120}
        height={40}
        className={`animate-pulse ${className ?? ""}`}
        priority
      />
    </div>
  );
}

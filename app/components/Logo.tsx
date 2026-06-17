import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/etusl.png"
      alt="ETUSL Logo"
      width={120}
      height={40}
      className={className}
      priority
    />
  );
}

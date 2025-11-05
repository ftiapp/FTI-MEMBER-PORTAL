import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center flex-shrink-0">
      <Image
        src="/FTI-MasterLogo-Naming_RGB-forLightBG.png"
        alt="สภาอุตสาหกรรมแห่งประเทศไทย (FTI Portal)"
        width={300}
        height={63}
        priority
        className="h-16 w-auto"
        sizes="(max-width: 1024px) 240px, 300px"
      />
    </Link>
  );
}

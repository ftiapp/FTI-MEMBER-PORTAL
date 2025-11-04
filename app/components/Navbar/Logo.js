import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/FTI-MasterLogo-Naming_RGB-forLightBG.png"
        alt="สภาอุตสาหกรรมแห่งประเทศไทย (FTI Portal)"
        width={240}
        height={50}
        priority
      />
    </Link>
  );
}

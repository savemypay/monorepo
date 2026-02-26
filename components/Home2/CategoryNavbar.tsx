import Link from "next/link";
import Image from "next/image";

export default function CategoryNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(232,168,48,0.18)] bg-[#f5f4f6] backdrop-blur-xl">
      <div className="mx-auto flex h-14 md:h-20 max-w-[1200px] items-center px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-3 no-underline"
          aria-label="SaveMyPay Home"
        >
          <Image src="/assets/logo1.png" alt="SaveMyPay" width={160} height={56} />
        </Link>
      </div>
    </header>
  );
}

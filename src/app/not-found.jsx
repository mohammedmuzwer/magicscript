import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import Logo from "@/components/ui/logo";
import { AuroraBackground } from "@/components/ui/background";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center px-5">
      <AuroraBackground />
      <div className="text-center">
        <Logo size={40} href={null} />
        <h1 className="mt-8 font-display text-7xl font-bold gradient-text">404</h1>
        <p className="mt-2 font-display text-xl font-bold">Page not found</p>
        <p className="mt-1.5 text-sm text-soft">
          That topic hasn't been verified yet — let's get you back on track.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/" className="btn btn-ghost px-5 py-2.5 text-sm">
            <Home size={15} /> Home
          </Link>
          <Link href="/dashboard" className="btn btn-primary px-5 py-2.5 text-sm">
            <Sparkles size={15} /> Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

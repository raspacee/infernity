import { cn } from "@/lib/utils";

export default function LogoName({ className }: { className?: string }) {
  return (
    <h1
      className={cn(
        "text-xl font-semibold bg-gradient-to-r from-violet-900 via-indigo-700 to-violet-600 bg-clip-text text-transparent tracking-tight",
        className
      )}
    >
      Infernity
    </h1>
  );
}

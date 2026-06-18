import Link from "next/link";

type PublicHeaderProps = {
  showLogin?: boolean;
};

export const PublicHeader = ({ showLogin = true }: PublicHeaderProps) => {
  return (
    <header className="border-b border-border bg-surface-elevated">
      <div className="container-app flex items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-text transition-colors group-hover:text-accent">
            XRlab Assembler
          </span>
        </Link>
        {showLogin && (
          <Link
            href="/login"
            className="text-sm font-medium text-text-muted transition-colors hover:text-accent"
          >
            Вход для исполнителя
          </Link>
        )}
      </div>
    </header>
  );
};

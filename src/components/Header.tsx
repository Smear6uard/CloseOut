import { User, LogOut } from "lucide-react";
import { Button } from "./ui/Button";

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        {actions}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
          <User className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-700">Account</span>
        </div>
      </div>
    </header>
  );
}

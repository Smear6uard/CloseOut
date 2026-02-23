import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { Button } from "../components/ui/Button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <HardHat className="h-10 w-10 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sign in to CloseOut
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your construction punch lists
          </p>
        </div>

        {/* Auth placeholder — Agent 3 will integrate Clerk/Auth0 here */}
        <div className="space-y-4">
          <Button className="w-full" variant="secondary">
            Continue with Google
          </Button>
          <Button className="w-full" variant="secondary">
            Continue with GitHub
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                or continue with email
              </span>
            </div>
          </div>
          <Button className="w-full">Sign In with Email</Button>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

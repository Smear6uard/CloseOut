import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HardHat,
  Camera,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/Button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <HardHat className="h-7 w-7 text-brand-600" />
            <span className="text-xl font-bold text-slate-900">CloseOut</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Close out projects faster with{" "}
            <span className="text-brand-600">AI-powered</span> punch lists
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Streamline construction inspections, track defects in real-time, and
            let AI analyze photos to verify completions. Built for contractors,
            PMs, and field teams.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-slate-900">
            Everything you need to close out faster
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={Camera}
              title="Photo Documentation"
              description="Capture defect and completion photos. Drag-and-drop upload with automatic organization per item."
            />
            <FeatureCard
              icon={Zap}
              title="AI Analysis"
              description="AI automatically tags defects, suggests trades, and compares before/after photos to verify fixes."
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-Time Tracking"
              description="Live dashboards show project progress, open items by trade, and team workload at a glance."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-slate-900">
            Simple, transparent pricing
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <PricingCard
              name="Free"
              price="$0"
              period="/month"
              features={[
                "2 projects",
                "25 punch items/month",
                "Photo uploads",
                "Basic filtering",
              ]}
            />
            <PricingCard
              name="Pro"
              price="$29"
              period="/month"
              features={[
                "50 projects",
                "500 punch items/month",
                "AI photo analysis",
                "PDF reports",
                "Priority support",
              ]}
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period=""
              features={[
                "Unlimited projects",
                "Unlimited items",
                "AI photo analysis",
                "Custom integrations",
                "Dedicated support",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-500">
              CloseOut &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="mb-4 inline-flex rounded-lg bg-brand-50 p-3">
        <Icon className="h-6 w-6 text-brand-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-8 ${
        highlighted
          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
          : "border-slate-200 bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      <div className="mt-4">
        <span className="text-4xl font-bold text-slate-900">{price}</span>
        <span className="text-slate-500">{period}</span>
      </div>
      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>
      <Link to="/login" className="mt-8 block">
        <Button
          variant={highlighted ? "primary" : "secondary"}
          className="w-full"
        >
          {name === "Enterprise" ? "Contact Sales" : "Get Started"}
        </Button>
      </Link>
    </div>
  );
}

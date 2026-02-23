import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../../components/Header";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { UsageMeter } from "../../components/UsageMeter";
import { PLAN_LIMITS } from "../../lib/constants";
import { useEnsureUser } from "../../hooks/useEnsureUser";
import { useCheckoutUrl, usePortalUrl, usePlanAccess } from "../../hooks/useBilling";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useEnsureUser();
  const { plan } = usePlanAccess();
  const limits = PLAN_LIMITS[plan];
  const checkoutUrl = useCheckoutUrl("pro");
  const portalUrl = usePortalUrl();

  return (
    <div>
      <Header title="Settings" />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {/* Profile */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Profile</h2>
          <div className="space-y-4">
            <Input
              label="Name"
              value={user?.name || ""}
              placeholder="Your name"
              disabled
            />
            <Input
              label="Email"
              value={user?.email || ""}
              disabled
            />
          </div>
        </Card>

        {/* Plan & Usage */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Plan & Usage</h2>
            <Badge color={plan === "pro" ? "blue" : plan === "team" ? "purple" : "gray"}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </Badge>
          </div>
          <div className="space-y-4">
            <UsageMeter
              label="Punch Items This Month"
              used={user?.punchItemsCreatedThisMonth || 0}
              limit={limits.punchItemsPerMonth}
            />
            <UsageMeter
              label="Projects"
              used={0}
              limit={limits.projectsLimit}
            />
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-700">AI Photo Analysis</span>
              <Badge color={limits.aiEnabled ? "green" : "gray"}>
                {limits.aiEnabled ? "Enabled" : "Upgrade to Pro"}
              </Badge>
            </div>
          </div>
          {plan === "free" && checkoutUrl && (
            <div className="mt-6">
              <Button onClick={() => (window.location.href = checkoutUrl)}>
                Upgrade to Pro — $29/mo
              </Button>
            </div>
          )}
        </Card>

        {/* Billing */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Billing</h2>
          <p className="text-sm text-slate-500">
            {user?.polarSubscriptionId
              ? "Manage your subscription and payment method."
              : "No active subscription. Upgrade to Pro for more features."}
          </p>
          {portalUrl && (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => (window.location.href = portalUrl)}
            >
              Manage Billing
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}

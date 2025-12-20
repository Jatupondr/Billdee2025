import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { SidebarInput } from "@/components/ui/sidebar";

export function SidebarOptInForm() {
  return (
    <Card className="gap-2 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Upgrade to Pro</CardTitle>
        <CardDescription>
          Unlock advanced features by upgrading to BillDee Pro.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <form>
          <div className="grid gap-2.5">
            <Button
              className="bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none cursor-pointer hover:bg-sidebar-primary/90"
              size="sm"
            >
              Upgrade
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import RolePage from "@/app/role-page";

export default function ProductionPage() {
  return (
    <RolePage role="production" view="orders" validViews={["orders"]} />
  );
}

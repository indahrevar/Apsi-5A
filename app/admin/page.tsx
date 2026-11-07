import RolePage from "@/app/role-page";

export default function AdminPage() {
  return (
    <RolePage
      role="admin"
      view="dashboard"
      validViews={[
        "dashboard",
        "menu",
        "orders",
        "fulfillment",
        "sales",
        "reviews",
      ]}
    />
  );
}

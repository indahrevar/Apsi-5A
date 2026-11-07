import RolePage from "@/app/role-page";

export default function OwnerPage() {
  return (
    <RolePage
      role="owner"
      view="dashboard"
      validViews={["dashboard", "stock", "reports", "reviews"]}
    />
  );
}

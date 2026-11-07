import RolePage from "@/app/role-page";

export default function CustomerPage() {
  return (
    <RolePage
      role="customer"
      view="menu"
      validViews={["menu", "checkout", "orders", "reviews"]}
    />
  );
}

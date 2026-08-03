import { getCurrentUser } from "@/server/current-user";
import UserMenuClient from "./UserMenuClient";

export default async function UserMenu() {
  const user = await getCurrentUser();

  return <UserMenuClient user={user} />;
}

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.email === "feneelp@gmail.com") return <div>page</div>;
  return <div>Access Denied</div>;
};

export default page;

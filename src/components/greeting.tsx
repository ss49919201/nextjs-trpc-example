"use client";
import { clientApi } from "@/app/_trpc/clientApi";
import { FC } from "react";

const Greeting: FC = () => {
  const greeting1 = clientApi.greeting1.useQuery({
    name: "John Doe",
  });
  clientApi.greeting1.useSuspenseQuery({
    name: "John Doe",
  });

  clientApi.greeting2.useMutation().mutate({
    name: "John Doe",
    date: new Date(),
  });
  return (
    <div className="bg-red-100 p-5 border-2 border-red-500">
      <div className="text-red-500 font-bold">Client Component</div>
      <div>{JSON.stringify(greeting1.data)}</div>
    </div>
  );
};

export default Greeting;

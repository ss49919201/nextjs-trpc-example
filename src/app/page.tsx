import { serverApi } from "./_trpc/serverApi";
import Greeting from "@/components/greeting";

const Home = async () => {
  // Server API
  const greeting1 = await serverApi.greeting1({
    name: "Next",
  });
  const greeting2 = await serverApi.greeting2({
    name: "Next",
    date: new Date("2021-01-01"),
  });

  return (
    <div className="">
      <div className="bg-blue-100 p-5 border-2 border-blue-500">
        <div className="text-blue-500 font-bold">Server Component</div>
        <div>{JSON.stringify(greeting1)}</div>
        <div>{JSON.stringify(greeting2)}</div>
      </div>
      <Greeting />
    </div>
  );
};

export default Home;

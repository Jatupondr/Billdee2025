import { Suspense } from "react";
import Setting from "./_components/setting";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Setting />
    </Suspense>
  );
};

export default Page;

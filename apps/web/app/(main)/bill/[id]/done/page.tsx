import BillDone from "../../_components/bill-done";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <BillDone id={id} />;
};

export default Page;

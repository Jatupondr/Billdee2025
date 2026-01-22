import ViewBillExp from "@/app/(main)/bill-expense/_components/view-bill-exp";




const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <ViewBillExp id={id} />;
};

export default Page;

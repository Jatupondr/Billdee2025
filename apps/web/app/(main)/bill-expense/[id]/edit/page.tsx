import EditBillExp from "@/app/(main)/bill-expense/_components/edit-bill-exp";


const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <EditBillExp id={id} />;
}

export default Page;

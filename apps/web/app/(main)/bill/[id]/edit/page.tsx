import React from "react";
import EditBill from "../../_components/edit-bill";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <EditBill id={id} />;
};

export default Page;

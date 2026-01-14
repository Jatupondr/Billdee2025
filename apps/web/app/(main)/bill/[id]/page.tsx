import React from "react";
import ViewBill from "../_components/view-bill";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <ViewBill id={id} />;
};

export default Page;

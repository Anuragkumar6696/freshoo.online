import React from "react";
import { ProductDetailsClient } from "./ProductDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailsClient id={id} />;
}

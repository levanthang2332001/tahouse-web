"use client";

import React from "react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="w-full space-y-6">
      <ProductForm isEditing={false} />
    </div>
  );
}

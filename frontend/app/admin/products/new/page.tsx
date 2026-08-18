"use client";

import React from "react";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ProductForm isEditing={false} />
    </div>
  );
}

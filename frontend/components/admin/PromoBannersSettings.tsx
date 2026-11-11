"use client";

import BannerListSettings from "@/components/admin/BannerListSettings";

// Khai báo ngoài component để tham chiếu ổn định (nằm trong deps của effect tải dữ liệu)
const FALLBACK = ["/promo/uudai.jpg"];

export default function PromoBannersSettings() {
  return (
    <BannerListSettings
      field="promoBanners"
      label="banner ưu đãi"
      title="Banner ưu đãi trang Sản phẩm"
      description="Hiển thị ở đầu trang /products. Tối đa 10 ảnh, nhiều ảnh sẽ tự chuyển sau mỗi 6 giây. Xóa hết ảnh để ẩn banner."
      min={0}
      max={10}
      recommendedMin={1}
      fallback={FALLBACK}
      uploadFolder="promo"
      previewAspectClass="aspect-[16/5]"
      uploadHint="Hỗ trợ JPG, PNG, WEBP. Khuyến nghị ảnh ngang tỷ lệ 16:5 (vd. 2560×800)."
      emptyHint="Chưa có banner ưu đãi — trang Sản phẩm đang ẩn banner."
      tipTitle="Cơ chế hiển thị trên trang Sản phẩm:"
      tipBody={
        <p>
          Banner nằm phía trên tiêu đề trang <strong>/products</strong>. Có từ 2 ảnh trở lên sẽ tự chuyển sau mỗi{" "}
          <strong>6 giây</strong>, khách có thể bấm chấm tròn để chọn ảnh.
        </p>
      }
    />
  );
}

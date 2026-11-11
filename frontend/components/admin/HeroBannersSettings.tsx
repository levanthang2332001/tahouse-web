"use client";

import BannerListSettings from "@/components/admin/BannerListSettings";

// Khai báo ngoài component để tham chiếu ổn định (nằm trong deps của effect tải dữ liệu)
const FALLBACK = ["/parner.jpg"];

export default function HeroBannersSettings() {
  return (
    <BannerListSettings
      field="heroBanners"
      label="banner hero"
      title="Ảnh bìa Hero Trang chủ (Auto Scroll)"
      description="Tự động cuộn sang trái sau mỗi 8 giây trên trang chủ. Tối thiểu 1 ảnh, tối đa 10 ảnh (khuyến nghị 5 - 10 ảnh)."
      min={1}
      max={10}
      recommendedMin={5}
      fallback={FALLBACK}
      uploadFolder="banners"
      uploadHint="Có thể chọn nhiều ảnh cùng lúc. Hỗ trợ JPG, PNG, WEBP (tỷ lệ 16:9 hoặc ảnh ngang showroom)."
      tipTitle="Cơ chế hiển thị trên trang chủ:"
      tipBody={
        <p>
          Ảnh banner sẽ tự động cuộn mượt mà sang trái sau mỗi <strong>8 giây</strong>. Khách truy cập cũng có thể bấm
          vào các nút chuyển slide hoặc hover chuột để xem chi tiết.
        </p>
      }
    />
  );
}

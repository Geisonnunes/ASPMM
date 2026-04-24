import defaultFacilityImage from "@/assets/campo-society.jpg";

export type FacilityRow = {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  rating: number | null;
  image_url: string | null;
  facility_images?: { id: string; url: string; order_index: number }[];
};

export function facilityRowToCardProps(row: FacilityRow) {
  const images =
    row.facility_images && row.facility_images.length > 0
      ? [...row.facility_images]
          .sort((a, b) => a.order_index - b.order_index)
          .map((img) => img.url)
      : row.image_url?.trim()
        ? [row.image_url.trim()]
        : [defaultFacilityImage];

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    capacity: row.capacity,
    rating: row.rating != null ? Number(row.rating) : 0,
    images,
  };
}

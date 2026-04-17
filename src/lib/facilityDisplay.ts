import defaultFacilityImage from "@/assets/campo-society.jpg";

export type FacilityRow = {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  rating: number | null;
  image_url: string | null;
};

export function facilityRowToCardProps(row: FacilityRow) {
  return {
    name: row.name,
    description: row.description ?? "",
    capacity: row.capacity,
    rating: row.rating != null ? Number(row.rating) : 0,
    image: row.image_url?.trim() || defaultFacilityImage,
  };
}

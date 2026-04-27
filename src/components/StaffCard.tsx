import { MessageCircle } from "lucide-react";

interface StaffCardProps {
  name: string;
  role: string;
  photo_url: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  whatsapp?: string | null;
}

const StaffCard = ({
  name,
  role,
  photo_url,
  facebook_url,
  twitter_url,
  instagram_url,
  whatsapp,
}: StaffCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hasSocial = facebook_url || twitter_url || instagram_url || whatsapp;

  return (
    <div className="group relative flex flex-col items-center text-center">
      {/* Foto */}
      <div className="relative mb-4">
        <div className="h-40 w-40 rounded-2xl overflow-hidden border-4 border-background shadow-elevated transition-transform duration-300 group-hover:-translate-y-1">
          {photo_url ? (
            <img
              src={photo_url}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Redes sociais — aparecem ao hover */}
        {hasSocial && (
          <div className="absolute -right-3 top-2 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            {facebook_url && (
              <a
                href={facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-soft-md hover:scale-110 transition-transform"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            )}
            {twitter_url && (
              <a
                href={twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-soft-md hover:scale-110 transition-transform"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {instagram_url && (
              <a
                href={instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-soft-md hover:scale-110 transition-transform"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft-md hover:scale-110 transition-transform"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Nome e cargo */}
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-foreground text-base leading-tight">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>

      {/* Linha decorativa */}
      <div className="mt-3 h-0.5 w-8 rounded-full bg-primary/30 transition-all duration-300 group-hover:w-16 group-hover:bg-primary" />
    </div>
  );
};

export default StaffCard;

import type { AnchorHTMLAttributes } from "react"
import WhatsAppIcon from "@/components/icons/WhatsAppIcon"

type ContactVariant = "phone" | "whatsapp"

type ContactActionButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  variant: ContactVariant
  label: string
  mobileLabel?: string
  desktopLabel?: string
  className?: string
  iconClassName?: string
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"

const variantClasses: Record<ContactVariant, string> = {
  phone: "bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-500",
  whatsapp: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
}

function PhoneIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )
}

export default function ContactActionButton({
  variant,
  label,
  mobileLabel,
  desktopLabel,
  className,
  iconClassName = "h-4 w-4",
  target,
  rel,
  ...props
}: ContactActionButtonProps) {
  const computedRel = target === "_blank" ? rel || "noopener noreferrer" : rel

  return (
    <a
      target={target}
      rel={computedRel}
      className={`${baseClasses} ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    >
      {variant === "whatsapp" ? <WhatsAppIcon className={iconClassName} /> : <PhoneIcon className={iconClassName} />}
      {desktopLabel ? (
        <>
          <span className="md:hidden">{mobileLabel ?? label}</span>
          <span className="hidden md:inline">{desktopLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </a>
  )
}
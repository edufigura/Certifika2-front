import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * `accent`/`soft`: tintado al teal del tema.
   * `mono`/`mono-soft`: blanco y negro.
   * `outline`/`outline-accent`: line art invertido (trazo claro sobre oscuro).
   * `plain`: sin filtro.
   */
  tone?:
    | "accent"
    | "soft"
    | "mono"
    | "mono-soft"
    | "outline"
    | "outline-accent"
    | "plain";
  className?: string;
  priority?: boolean;
};

/**
 * Ilustración decorativa. Las de unDraw vienen a color, así que se las tinta
 * con el acento del tema vía filtros CSS y se desvanecen los bordes con una
 * máscara para que se integren con el fondo oscuro.
 */
export default function Illustration({
  src,
  alt,
  width,
  height,
  tone = "accent",
  className,
  priority,
}: Props) {
  const classes = ["illus", `illus--${tone}`, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        aria-hidden={alt === "" ? true : undefined}
      />
    </div>
  );
}

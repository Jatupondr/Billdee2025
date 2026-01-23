import { cn } from "@/lib/utils"

function AspectRatio({
  ratio,
  className,
  ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "style"> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  )
}

export { AspectRatio }

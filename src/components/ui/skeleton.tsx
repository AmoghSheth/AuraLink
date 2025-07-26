import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm", className)}
      {...props}
    />
  )
}

export { Skeleton }

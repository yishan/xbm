// Showcase inspired by satnaing/shadcn-admin (MIT). https://github.com/satnaing/shadcn-admin
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type RecentSale = {
  name: string
  email: string
  amount: string
}

const recentSales: RecentSale[] = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
  },
  {
    name: "William Kim",
    email: "william.kim@email.com",
    amount: "+$99.00",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
  },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function RecentSales() {
  return (
    <div className="space-y-6" data-testid="recent-sales">
      {recentSales.map((sale) => (
        <div key={sale.email} className="flex min-w-0 items-center gap-4">
          <Avatar className="size-9">
            <AvatarFallback>{getInitials(sale.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {sale.email}
            </p>
          </div>
          <div className="ml-auto font-medium tabular-nums">{sale.amount}</div>
        </div>
      ))}
    </div>
  )
}

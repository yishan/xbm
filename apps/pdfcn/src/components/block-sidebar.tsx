// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn
import { BLOCKS, type BlockId } from "@/lib/blocks"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type BlockSidebarProps = {
  activeId: BlockId
  onSelect: (id: BlockId) => void
}

export function BlockSidebar({ activeId, onSelect }: BlockSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="gap-1 px-3 py-4">
        <h2 className="text-sm font-semibold tracking-tight">Blocks</h2>
        <p className="text-xs text-muted-foreground">Inspired by pdfcn</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarMenu>
            {BLOCKS.map((b) => (
              <SidebarMenuItem key={b.id}>
                <SidebarMenuButton
                  isActive={activeId === b.id}
                  onClick={() => onSelect(b.id)}
                  tooltip={b.name}
                  data-testid={`block-${b.id}`}
                >
                  <div className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="truncate text-sm">{b.name}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {b.description}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <a
          href="https://github.com/shadcn-labs/pdfcn"
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          data-testid="sidebar-attribution"
        >
          MIT licensed · Inspired by pdfcn
        </a>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

import * as React from "react"
import { PanelLeftIcon, GripVertical } from "lucide-react"
import { Tooltip } from "@mui/material"
import { cn } from "../../lib/utils"

/**
 * Composable sidebar primitives, adapted from shadcn/ui's Sidebar component
 * for this project (plain JS/JSX, no TypeScript, no Radix/Base UI — this
 * codebase has neither, so collapse/mobile behavior is implemented directly
 * with React state + Tailwind rather than Sheet/Tooltip/Slot primitives).
 *
 * Collapsing to icon width works by clipping the sidebar container to
 * --sidebar-width-icon with overflow hidden while its inner content keeps
 * flowing at full width — so any content placed inside "just works" without
 * needing to know about collapse state. SidebarMenuButton and
 * SidebarGroupLabel additionally read collapse state directly to hide
 * label text cleanly and show a hover tooltip instead of clipping mid-word.
 */

const SIDEBAR_STORAGE_KEY = "sidebar_state"
const SIDEBAR_WIDTH = "18rem"
const SIDEBAR_WIDTH_MOBILE = "20rem"
const SIDEBAR_WIDTH_ICON = "3.5rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
const MOBILE_BREAKPOINT = "(max-width: 1023px)"

const SidebarContext = React.createContext(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const [openMobile, setOpenMobile] = React.useState(false)

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(() => {
    if (typeof window === "undefined") return defaultOpen
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored != null ? stored === "true" : defaultOpen
  })
  const open = openProp ?? uncontrolledOpen
  const setOpen = React.useCallback(
    (value) => {
      const next = typeof value === "function" ? value(open) : value
      if (setOpenProp) setOpenProp(next)
      else setUncontrolledOpen(next)
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
    },
    [setOpenProp, open]
  )

  // Default to "icon" so the very first render (before the mounted
  // Sidebar's effect reports its actual collapsible mode) doesn't briefly
  // flash the offcanvas (fully-hidden) layout for apps using icon-collapse.
  const [collapsible, setCollapsible] = React.useState("icon")

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)
  }, [isMobile, setOpen])

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      collapsible,
      setCollapsible,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, collapsible]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={{ display: "flex", minHeight: "100svh", width: "100%", ...style }}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile, setCollapsible } = useSidebar()

  React.useEffect(() => {
    setCollapsible(collapsible)
  }, [collapsible, setCollapsible])

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn("flex h-full flex-col", className)}
        style={{ width: SIDEBAR_WIDTH, background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <div
          data-slot="sidebar"
          data-mobile="true"
          data-state={openMobile ? "open" : "closed"}
          className={cn(
            "fixed inset-y-0 z-50 flex flex-col transition-transform duration-300 ease-in-out",
            side === "left" ? "left-0" : "right-0",
            openMobile ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full",
            className
          )}
          style={{
            width: SIDEBAR_WIDTH_MOBILE,
            background: "var(--sidebar)",
            color: "var(--sidebar-foreground)",
            borderRight: side === "left" ? "1px solid var(--sidebar-border)" : undefined,
            borderLeft: side === "right" ? "1px solid var(--sidebar-border)" : undefined,
          }}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }

  const iconCollapsed = state === "collapsed" && collapsible === "icon"
  const offcanvasCollapsed = state === "collapsed" && collapsible === "offcanvas"
  const width = offcanvasCollapsed ? "0px" : iconCollapsed ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      className={cn("hidden lg:flex h-svh flex-col shrink-0 overflow-hidden transition-[width] duration-200 ease-linear sticky top-0", className)}
      style={{
        width,
        minWidth: width,
        background: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
        borderRight: side === "left" ? "1px solid var(--sidebar-border)" : undefined,
        borderLeft: side === "right" ? "1px solid var(--sidebar-border)" : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      data-slot="sidebar-trigger"
      type="button"
      onClick={(e) => {
        onClick?.(e)
        toggleSidebar()
      }}
      className={cn(
        "inline-flex items-center justify-center size-8 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] smooth-transition cursor-pointer",
        className
      )}
      {...props}
    >
      <PanelLeftIcon className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

export function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      data-slot="sidebar-rail"
      type="button"
      title="Toggle Sidebar"
      onClick={toggleSidebar}
      className={cn(
        "hidden lg:flex items-center justify-center w-2.5 shrink-0 cursor-col-resize hover:bg-[var(--accent)] smooth-transition group/rail",
        className
      )}
      {...props}
    >
      <GripVertical className="size-3 text-[var(--muted-foreground)] opacity-0 group-hover/rail:opacity-100" />
    </button>
  )
}

export function SidebarInset({ className, ...props }) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("flex flex-1 flex-col min-w-0", className)}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 border-b", className)}
      style={{ borderColor: "var(--sidebar-border)" }}
      {...props}
    />
  )
}

export function SidebarFooter({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 border-t", className)}
      style={{ borderColor: "var(--sidebar-border)" }}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
}

export function SidebarGroup({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  )
}

export function SidebarGroupLabel({ className, children, ...props }) {
  const { state, collapsible, isMobile } = useSidebar()
  const iconCollapsed = !isMobile && state === "collapsed" && collapsible === "icon"
  if (iconCollapsed) return null
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "px-3.5 mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap",
        className
      )}
      style={{ color: "var(--muted-foreground)" }}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarGroupAction({ className, ...props }) {
  return (
    <button
      data-slot="sidebar-group-action"
      type="button"
      className={cn(
        "absolute right-3 top-1 inline-flex size-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] smooth-transition cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export function SidebarGroupContent({ className, ...props }) {
  return <div data-slot="sidebar-group-content" className={cn("w-full", className)} {...props} />
}

export function SidebarMenu({ className, ...props }) {
  return (
    <ul data-slot="sidebar-menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  )
}

export function SidebarMenuItem({ className, ...props }) {
  return <li data-slot="sidebar-menu-item" className={cn("group/menu-item relative list-none", className)} {...props} />
}

export function SidebarMenuButton({
  as: Comp = "button",
  isActive = false,
  tooltip,
  className,
  children,
  ...props
}) {
  const { state, collapsible, isMobile } = useSidebar()
  const iconCollapsed = !isMobile && state === "collapsed" && collapsible === "icon"

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "flex items-center gap-3 rounded-md text-[14px] font-medium smooth-transition w-full overflow-hidden",
        iconCollapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5",
        isActive
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
        className
      )}
      {...(Comp === "button" ? { type: "button" } : {})}
      {...props}
    >
      {React.Children.map(children, (child, i) => {
        // Hide non-icon (text) children when collapsed to icon width, so we
        // don't rely on clipping to hide label text mid-character.
        if (iconCollapsed && i > 0) return null
        return child
      })}
    </Comp>
  )

  if (iconCollapsed && tooltip) {
    return (
      <Tooltip title={tooltip} placement="right">
        <div>{button}</div>
      </Tooltip>
    )
  }

  return button
}

export function SidebarMenuAction({ className, ...props }) {
  return (
    <button
      data-slot="sidebar-menu-action"
      type="button"
      className={cn(
        "absolute right-2 top-1.5 inline-flex size-6 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] smooth-transition cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export function SidebarMenuBadge({ className, ...props }) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      className={cn(
        "absolute right-2 top-1.5 min-w-5 rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold",
        className
      )}
      style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
      {...props}
    />
  )
}

export function SidebarMenuSkeleton({ className, showIcon = false }) {
  return (
    <div data-slot="sidebar-menu-skeleton" className={cn("flex items-center gap-3 px-4 py-2.5", className)}>
      {showIcon && <div className="size-4 rounded animate-pulse" style={{ background: "var(--muted)" }} />}
      <div className="h-3.5 flex-1 rounded animate-pulse" style={{ background: "var(--muted)", maxWidth: `${Math.floor(Math.random() * 30) + 50}%` }} />
    </div>
  )
}

export function SidebarMenuSub({ className, ...props }) {
  const { state, collapsible, isMobile } = useSidebar()
  const iconCollapsed = !isMobile && state === "collapsed" && collapsible === "icon"
  if (iconCollapsed) return null
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn("flex min-w-0 flex-col gap-1 ml-4 pl-3 border-l", className)}
      style={{ borderColor: "var(--sidebar-border)" }}
      {...props}
    />
  )
}

export function SidebarMenuSubItem({ className, ...props }) {
  return <li data-slot="sidebar-menu-sub-item" className={cn("list-none", className)} {...props} />
}

export function SidebarMenuSubButton({ isActive = false, className, ...props }) {
  return (
    <button
      data-slot="sidebar-menu-sub-button"
      type="button"
      data-active={isActive}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] smooth-transition",
        isActive
          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  )
}

export function SidebarSeparator({ className, ...props }) {
  return (
    <hr
      data-slot="sidebar-separator"
      className={cn("mx-3.5 my-1 border-t", className)}
      style={{ borderColor: "var(--sidebar-border)" }}
      {...props}
    />
  )
}

export function SidebarInput({ className, ...props }) {
  return (
    <input
      data-slot="sidebar-input"
      className={cn(
        "w-full rounded-md px-3 py-1.5 text-[13px] border focus:outline-none focus:border-[var(--ring)]",
        className
      )}
      style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground)" }}
      {...props}
    />
  )
}

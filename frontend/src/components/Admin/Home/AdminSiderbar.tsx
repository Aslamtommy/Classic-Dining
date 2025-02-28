import * as React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { LayoutDashboard, Users, UserCog, MessageSquare, ClipboardCheck, LogOut, ChevronLeft, Bell, Ticket } from "lucide-react"
import { cn } from "../../../lib/utils"

interface SidebarProps {
  className?: string
}

export function AdminSiderbar({ className }: SidebarProps) {
  const [expanded, setExpanded] = React.useState(true)
  const [selected, setSelected] = React.useState("Users")
  const navigate = useNavigate()  

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
      badge: null,
    },
    {
      name: "Users",
      icon: Users,
      path: "/admin/users",
      badge: "12",
    },
    {
      name: "Restaurants",
      icon: UserCog,
      path: "/admin/restaurents",
      badge: "3",
    },
    {
      name: "Messages",
      icon: MessageSquare,
      path: "/admin/messages",
      badge: "5",
    },
    {
      name: "Approvals",
      icon: ClipboardCheck,
      path: "/admin/approvals",
      badge: "2",
    },
    {
      name: "Coupons Management",
      icon: Ticket,
      path: "/admin/coupons",
      badge: "4",
    },
  ]

  return (
    <motion.aside
      initial={{ width: expanded ? 280 : 80 }}
      animate={{ width: expanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn("relative flex flex-col border-r border-gray-200 bg-white", className)}
    >
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XROaofSZ1nLEMjqy244omqW946vv0m.png"
          alt="Logo"
          className="h-9 w-9 rounded-lg bg-primary/10"
        />
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-1 items-center justify-between"
          >
            <span className="text-lg font-semibold text-gray-900">Admin</span>
            <div className="flex items-center gap-2">
              <button className="group rounded-full p-1.5 hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setExpanded((curr) => !curr)}
        className="absolute -right-4 top-20 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700"
      >
        <ChevronLeft className={cn("h-5 w-5 transition-transform", !expanded && "rotate-180")} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setSelected(item.name)
              navigate(item.path) // Navigate to the selected path
            }}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-gray-700 hover:bg-gray-100/60",
              selected === item.name && "border-gray-200 bg-gray-100/80 font-medium text-gray-900 shadow-sm",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0",
                selected === item.name ? "text-primary" : "text-gray-400 group-hover:text-gray-500",
              )}
            />
            {expanded && (
              <>
                <span className="text-sm">{item.name}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto flex h-6 min-w-6 items-center justify-center rounded-full text-xs",
                      selected === item.name
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => console.log("Logout clicked")}
          className="group flex w-full items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
          {expanded && <span className="text-sm group-hover:text-red-500">Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}
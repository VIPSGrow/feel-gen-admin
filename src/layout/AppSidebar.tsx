"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Badge from "../components/ui/badge/Badge";
import serverCallFuction from "../lib/constantFunction";
import type { OrdersApiResponse } from "../types/orders";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  AlertIcon,
  BellIcon,
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  FileIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PencilIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { GitPullRequestIcon, IdCardIcon, ShieldCheck, Users } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; permission?: string; }[];
};

const allNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    permission: "dashboard",
    path: "/",
  },
  {
    icon: <UserCircleIcon />,
    name: "All Members",
    permission: "members",
    path: "/members",
  },
  {
    icon: <UserCircleIcon />,
    name: "All E Users",
    permission: "e-users",
    path: "/e-users",
  },
  {
    icon: <IdCardIcon />,
    name: "ID Card",
    permission: "id-card",
    path: "/id-card",
  },
  {
    icon: <ShieldCheck />,
    name: "Welcome Letter",
    permission: "welcome-letter",
    path: "/welcome-letter",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Network Tree",
    permission: "network-tree",
    path: "/network-tree",
  },
  {
    icon: <PageIcon />,
    name: "KYC Requests",
    permission: "kyc-requests",
    path: "/kyc-requests",
  },
  {
    icon: <PieChartIcon />,
    name: "Analytics",
    permission: "analytics",
    path: "/analytics",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Products",
    permission: "products",
    subItems: [
      { name: "All Products", path: "/products", permission: 'product-list' },
      { name: "Add Product", path: "/products/add", permission: 'add-product' },
      { name: "Category", path: "/products/category", permission: 'pro-category' },
      { name: "Attributes", path: "/products/attributes", permission: 'attributes' },
      { name: "Inventory", path: "/products/inventory", permission: 'inventory' },
    ]
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-percent-icon lucide-circle-percent"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="M9 9h.01" /><path d="M15 15h.01" /></svg>,
    name: "Coupons",
    permission: 'coupons',
    path: '/coupons'
  },
  {
    icon: <TableIcon />,
    name: "Orders",
    permission: "orders",
    path: "/orders",
  },
  {
    icon: <GitPullRequestIcon />,
    name: "Sample Requests",
    permission: "sample_request",
    path: "/sample_request",
  },
  {
    icon: <TableIcon />,
    name: "Distributor Orders",
    permission: "distributor-orders",
    subItems: [
      {
        name: "Placed Order",
        path: "/placed_order",
        permission: 'placed_order'
      },
      {
        name: "Recieved Order",
        path: "/recieved_order",
        permission: "recieved_order"
      }
    ]
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-barcode-icon lucide-barcode"><path d="M3 5v14" /><path d="M8 5v14" /><path d="M12 5v14" /><path d="M17 5v14" /><path d="M21 5v14" /></svg>,
    name: "Shop",
    permission: "purchase",
    path: "/shop",
  },
  {
    icon: <PieChartIcon />,
    name: "Commissions",
    permission: "commissions",
    subItems: [
      {
        name: "Level Commission",
        path: "/commissions",
      },
      {
        name: "Level Capping",
        path: "/commissions/level-capping",
        permission: 'level-capping'
      },
      {
        name: "Level Milestone",
        path: "/commissions/level-milestone",
        permission: 'level-milestone'
      },
      {
        name: "Rewards",
        path: "/commissions/rewards",
        permission: 'rewards'
      },
    ]
  },
  {
    icon: <FileIcon />,
    name: "Transactions",
    permission: "p-transactions",
    subItems: [
      {
        name: "All Transactions",
        path: "/transactions",
        permission: 'transactions'
      },
      {
        name: "Withdrawal Transactions",
        path: "/transactions/withdrawals",
        permission: "withdrawals"
      }
    ]
  },
  {
    icon: <BoxCubeIcon />,
    name: "Wallet",
    permission: "wallet",
    path: "/wallet",
  },
  {
    icon: <ListIcon />,
    name: "Withdrawal Requests",
    permission: "withdrawal-requests",
    path: "/withdrawal-requests",
  },
  {
    icon: <ListIcon />,
    name: "Withdrawals",
    permission: "withdrawals",
    path: "/withdrawals",
  },
  {
    icon: <TableIcon />,
    name: "GST / TDS",
    permission: "gst-tds",
    path: "/gst-tds",
  },
  {
    icon: <PieChartIcon />,
    name: "Reports",
    permission: "reports",
    subItems: [
      {
        name: "Sales Report",
        path: '/reports/sales',
      },
    ]
  },
  {
    icon: <PlugInIcon />,
    name: "Settings",
    permission: "settings",
    subItems: [
      {
        name: "MLM Plan Configuration",
        path: "/mlm-plan",
        permission: "mlm-plan",
      },
      {
        name: 'Configuration',
        path: "/settings"
      },
      {
        name: "Tax Setting",
        path: "/tax-setting"
      }
    ]
  },
  {
    icon: <Users />,
    name: "Staff",
    permission: "staff-header",
    subItems: [
      {
        name: 'Roles',
        permission: 'roles',
        path: '/roles'
      },
      {
        name: 'Staffs',
        permission: 'staff',
        path: '/staff'
      }
    ]
  },
  {
    icon: <UserCircleIcon />,
    name: "Blogs",
    permission: "blogs",
    subItems: [
      {
        name: "Blog",
        path: '/blog',
        permission: 'blog'
      },
      {
        name: "Blog Categories",
        path: '/blog/categories',
        permission: 'blog-categories'
      }
    ]
  },
  {
    icon: <PencilIcon />,
    name: "CMS",
    permission: 'cms',
    subItems: [
      {
        name: "Static Content",
        path: '/cms/static-content',
        permission: 'static-content'
      },
      {
        name: "States / CIty",
        path: '/cms/state-city',
        permission: 'state-city'
      },
      {
        name: "Team Members",
        path: '/cms/team-members',
        permission: 'team-member'
      },
      {
        name: "Banners",
        path: '/cms/banners',
        permission: 'banners'
      },
    ]
  },
  {
    icon: <AlertIcon />,
    name: "Notifications",
    permission: "notifications",
    path: '/notifications',
  },
  {
    icon: <FileIcon />,
    name: "Policies",
    permission: "policies",
    path: "/policies",
  },
  {
    icon: <PlugInIcon />,
    name: "Referral Link",
    permission: "referral",
    path: "/referral",
  },
  {
    icon: <ListIcon />,
    name: "Income Simulator",
    permission: "simulator",
    path: "/simulator",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, hasPermission } = useAuth();
  const pathname = usePathname();

  const [newOrderCount, setNewOrderCount] = useState<number>(0);
  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number; } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Memoize filtered components to stabilize identity structure across cycles
  const navItems = useMemo(() => {
    return allNavItems
      .filter((item) => !item.permission || hasPermission(item.permission))
      .map((item) => {
        if (item.subItems) {
          return {
            ...item,
            subItems: item.subItems.filter(
              (sub) => !sub.permission || hasPermission(sub.permission)
            ),
          };
        }
        return item;
      })
      .filter((item) => {
        if (item.subItems && item.subItems.length === 0 && !item.path) {
          return false;
        }
        return true;
      });
  }, [hasPermission]);

  useEffect(() => {
    const fetchNewOrders = async () => {
      try {
        const query = new URLSearchParams({ page: "1", limit: "10", filter: "all" }).toString();
        const res = (await serverCallFuction('GET', `api/orders?${query}`)) as unknown as OrdersApiResponse;
        if (res?.success !== false && res?.data && Array.isArray(res.data)) {
          const pending = res.data.filter((o) => o?.order_status === 'pending').length;
          setNewOrderCount(pending);
        }
      } catch {
        // ignore
      }
    };

    fetchNewOrders();
  }, [user?.id]);

  useEffect(() => {
    let matched: { type: "main" | "others"; index: number } | null = null;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : [];
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path) && !matched) {
              matched = {
                type: menuType as "main" | "others",
                index,
              };
            }
          });
        }
      });
    });

    setOpenSubmenu((prev) => {
      if (!matched) return prev;
      const nextKey = `${matched.type}-${matched.index}`;
      const prevKey = prev ? `${prev.type}-${prev.index}` : null;
      return nextKey === prevKey ? prev : matched;
    });
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    itemsToRender: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {itemsToRender.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                type="button"
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`w-full menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className={`${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                      }`}
                  />
                )}
              </button>

              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`] || 0}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                <span className="flex items-center gap-2">
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {nav.permission === 'orders' && newOrderCount > 0 && (isExpanded || isHovered || isMobileOpen) && (
                    <Badge color="success" className="menu-dropdown-badge-active ml-auto">{newOrderCount} New</Badge>
                  )}
                </span>
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image className="dark:hidden" src="/images/logo/n_logo.png" alt="Logo" width={150} height={40} />
              <Image className="hidden dark:block" src="/images/logo/n_logo.png" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <Image src="/images/logo/logo.png" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems.filter(item => !item.subItems || item.subItems.length > 0), "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
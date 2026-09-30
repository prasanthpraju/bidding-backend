"use client";

import {
  LayoutDashboard,
  Gavel,
  Ticket,
  Users,
  CreditCard,
  Image,
  ChevronDown,
  ChevronRight,
  Menu,
  LogOut,
  Search,
  Bell,
  Loader2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Admin {
  id: number | string;
  name: string;
  email: string;
  role: string;
  profileImage?: string | null;
}

interface DashboardStats {
  totalBids: number;
  totalLuckyDrawEvents: number;
  totalBiddingUsers: number;
  totalPayments: number;
}

export default function DashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [biddingOpen, setBiddingOpen] = useState(false);
  const [luckyDrawOpen, setLuckyDrawOpen] = useState(false);

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // --------------------------------------------------
  // Fetch Admin Details
  // --------------------------------------------------

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoadingAdmin(true);

        const response = await axios.get("/api/v1/admin", {
          withCredentials: true,
        });

        const data = response.data;

        if (!data) {
          throw new Error("Unable to fetch admin");
        }

        setAdmin(data?.data || data);
      } catch (error) {
        console.error("Fetch admin error:", error);
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchAdmin();
  }, []);

  // --------------------------------------------------
  // Fetch Dashboard Statistics
  // --------------------------------------------------

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);

        /*
          IMPORTANT:
          Replace this URL with your actual dashboard stats API.
        */

        const response = await fetch("/api/v1/admin/dashboard", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to fetch dashboard data"
          );
        }

        setStats(data?.data || data);
      } catch (error) {
        console.error("Dashboard stats error:", error);

        // Temporary default values
        setStats({
          totalBids: 0,
          totalLuckyDrawEvents: 0,
          totalBiddingUsers: 0,
          totalPayments: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --------------------------------------------------
  // Sidebar styles
  // --------------------------------------------------

  const sidebarItem =
    "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-gray-300 transition hover:bg-gray-800";

  const childItem =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 pl-11 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white";

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300`}
      >

        {/* Logo */}

        <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">

          {sidebarOpen && (
            <h1 className="text-xl font-bold">
              Admin Panel
            </h1>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-gray-800"
          >
            <Menu size={22} />
          </button>

        </div>

        {/* Navigation */}

        <nav className="mt-6 space-y-2 px-3">

          {/* Dashboard */}

          <button
            onClick={() => router.push("/dashboard")}
            className={`${sidebarItem} ${
              sidebarOpen ? "" : "justify-center"
            }`}
          >
            <LayoutDashboard size={20} />

            {sidebarOpen && (
              <span>Dashboard</span>
            )}
          </button>

          {/* =================================================
              BIDDING
          ================================================== */}

          <div>

            <button
              onClick={() => setBiddingOpen(!biddingOpen)}
              className={`${sidebarItem} ${
                sidebarOpen ? "" : "justify-center"
              }`}
            >

              <Gavel size={20} />

              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">
                    Bidding
                  </span>

                  {biddingOpen ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronRight size={17} />
                  )}
                </>
              )}

            </button>

            {/* Bidding Children */}

            {sidebarOpen && biddingOpen && (
              <div className="mt-1 space-y-1">

                <button
                  onClick={() =>
                    router.push("/dashboard/bidding")
                  }
                  className={childItem}
                >
                  <Gavel size={17} />
                  Biddings
                </button>

                <button
                  onClick={() =>
                    router.push("/dashboard/bidding-round")
                  }
                  className={childItem}
                >
                  <Ticket size={17} />
                  Bidding Round
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/dashboard/bidding-user-payment"
                    )
                  }
                  className={childItem}
                >
                  <CreditCard size={17} />
                  Bidding User Payment
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/dashboard/bidding-participants"
                    )
                  }
                  className={childItem}
                >
                  <Users size={17} />
                  Bidding Participants
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/dashboard/bidding-participant-payment"
                    )
                  }
                  className={childItem}
                >
                  <CreditCard size={17} />
                  Bidding Participant Payment
                </button>

              </div>
            )}

          </div>

          {/* =================================================
              LUCKY DRAW
          ================================================== */}

          <div>

            <button
              onClick={() =>
                setLuckyDrawOpen(!luckyDrawOpen)
              }
              className={`${sidebarItem} ${
                sidebarOpen ? "" : "justify-center"
              }`}
            >

              <Ticket size={20} />

              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">
                    Lucky Draw
                  </span>

                  {luckyDrawOpen ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronRight size={17} />
                  )}
                </>
              )}

            </button>

            {/* Lucky Draw Children */}

            {sidebarOpen && luckyDrawOpen && (
              <div className="mt-1 space-y-1">

                <button
                  onClick={() =>
                    router.push("/dashboard/lucky-draw")
                  }
                  className={childItem}
                >
                  <Ticket size={17} />
                  Lucky Draw
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/dashboard/lucky-draw-image"
                    )
                  }
                  className={childItem}
                >
                  <Image size={17} />
                  Lucky Draw Image
                </button>

              </div>
            )}

          </div>

        </nav>

        {/* Logout */}

        <div className="absolute bottom-5 w-full px-3">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-400 hover:bg-gray-800"
          >

            <LogOut size={20} />

            {sidebarOpen && (
              <span>Logout</span>
            )}

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className={`${
          sidebarOpen ? "ml-64" : "ml-20"
        } min-h-screen flex-1 transition-all duration-300`}
      >

        {/* Header */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">

          <div>

            <h2 className="text-xl font-semibold text-gray-800">
              Dashboard
            </h2>

            <p className="text-sm text-gray-500">
              Welcome back
              {admin?.name ? `, ${admin.name}` : ""}
            </p>

          </div>

          <div className="flex items-center gap-4">

            {/* Search */}

            <div className="hidden items-center rounded-lg border bg-gray-50 px-3 md:flex">

              <Search
                size={18}
                className="text-gray-400"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-40 bg-transparent px-2 py-2 text-sm outline-none"
              />

            </div>

            {/* Notification */}

            <button className="relative rounded-lg p-2 hover:bg-gray-100">

              <Bell size={21} />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />

            </button>

            {/* Admin Profile */}

            <div className="flex items-center gap-3">

              {loadingAdmin ? (

                <Loader2
                  size={20}
                  className="animate-spin text-gray-500"
                />

              ) : (

                <>

                  {admin?.profileImage ? (

                    <img
                      src={admin.profileImage}
                      alt={admin.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />

                  ) : (

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                      {admin?.name
                        ? admin.name
                            .charAt(0)
                            .toUpperCase()
                        : "A"}
                    </div>

                  )}

                  <div className="hidden sm:block">

                    <p className="text-sm font-medium text-gray-800">
                      {admin?.name || "Loading..."}
                    </p>

                    <p className="text-xs text-gray-500">
                      {admin?.role || ""}
                    </p>

                  </div>

                </>

              )}

            </div>

          </div>

        </header>

        {/* =====================================================
            DASHBOARD CONTENT
        ====================================================== */}

        <section className="p-6">

          <div className="mb-6">

            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Overview of your bidding and lucky draw system.
            </p>

          </div>

          {/* =================================================
              STATISTICS
          ================================================== */}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total Bids */}

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                  <Gavel size={22} />
                </div>

              </div>

              <p className="mt-4 text-sm text-gray-500">
                Total Bids
              </p>

              <h3 className="mt-1 text-2xl font-bold text-gray-800">

                {loadingStats ? (
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                ) : (
                  stats?.totalBids ?? 0
                )}

              </h3>

            </div>

            {/* Lucky Draw Events */}

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                  <Ticket size={22} />
                </div>

              </div>

              <p className="mt-4 text-sm text-gray-500">
                Lucky Draw Events
              </p>

              <h3 className="mt-1 text-2xl font-bold text-gray-800">

                {loadingStats ? (
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                ) : (
                  stats?.totalLuckyDrawEvents ?? 0
                )}

              </h3>

            </div>

            {/* Bidding Users */}

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="rounded-lg bg-green-100 p-3 text-green-600">
                  <Users size={22} />
                </div>

              </div>

              <p className="mt-4 text-sm text-gray-500">
                Bidding Users
              </p>

              <h3 className="mt-1 text-2xl font-bold text-gray-800">

                {loadingStats ? (
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                ) : (
                  stats?.totalBiddingUsers ?? 0
                )}

              </h3>

            </div>

            {/* Payments */}

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                  <CreditCard size={22} />
                </div>

              </div>

              <p className="mt-4 text-sm text-gray-500">
                Total Payments
              </p>

              <h3 className="mt-1 text-2xl font-bold text-gray-800">

                {loadingStats ? (
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                ) : (
                  stats?.totalPayments ?? 0
                )}

              </h3>

            </div>

          </div>

          {/* =================================================
              QUICK ACCESS
          ================================================== */}

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            {/* Bidding */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                  <Gavel size={24} />
                </div>

                <div>

                  <h3 className="text-lg font-semibold">
                    Bidding
                  </h3>

                  <p className="text-sm text-gray-500">
                    Manage bids, rounds, users and payments.
                  </p>

                </div>

              </div>

              <button
                onClick={() => {
                  setBiddingOpen(true);
                  router.push("/dashboard/bidding");
                }}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Manage Bidding
              </button>

            </div>

            {/* Lucky Draw */}

            <div className="rounded-xl bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                  <Ticket size={24} />
                </div>

                <div>

                  <h3 className="text-lg font-semibold">
                    Lucky Draw
                  </h3>

                  <p className="text-sm text-gray-500">
                    Manage lucky draw events and images.
                  </p>

                </div>

              </div>

              <button
                onClick={() => {
                  setLuckyDrawOpen(true);
                  router.push("/dashboard/lucky-draw");
                }}
                className="mt-5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Manage Lucky Draw
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}
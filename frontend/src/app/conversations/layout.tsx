import Sidebar from "@/components/sidebar/sidebar";
import Topbar from "@/components/topbar/topbar";
import { SidebarContextProvider } from "@/context/SidebarContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarContextProvider>
      <div className="h-svh flex w-svw">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarContextProvider>
  );
}

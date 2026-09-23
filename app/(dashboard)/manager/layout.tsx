import Navbar from "@/components/manager/navbar";
 import Sidebar from "@/components/manager/sidebar"; 
 import { getCurrentUser } from "@/lib/auth";
  export default async function DashboardLayout({ children, }: { children: React.ReactNode; }) { 
    const user = await getCurrentUser();
    return ( 
     <div className="min-h-screen bg-gray-100">
     <Navbar username={user?.username ?? ""} />
      <div className="flex"> 
        <Sidebar  />
         <main className="flex-1 overflow-y-auto p-6">
             {children} 
             </main> 
             </div> 
             </div> 
             );
             }
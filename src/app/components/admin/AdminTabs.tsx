import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminTabs() {
    const { slug } = useParams();
    const pathname = usePathname();

    const tabs = [
        { name: "Dashboard", href: `/${slug}/admin` },
        { name: "Barberos", href: `/${slug}/admin/barberos` },
        { name: "Servicios", href: `/${slug}/admin/servicios` },
    ];

    return (
        <div className="flex gap-4 mb-8">
            {tabs.map((tab) => (
                <Link
                    key={tab.name}
                    href={tab.href}
                    className={cn(
                        "px-4 py-2 rounded border transition-colors text-sm font-medium",
                        pathname === tab.href 
                            ? "bg-black text-white border-black" 
                            : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                >
                    {tab.name}
                </Link>
            ))}
        </div>
    );
}
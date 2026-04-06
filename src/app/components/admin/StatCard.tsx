export default function StatCard({
    title,
    value,
}: {
    title: string;
    value: number;
}) {
    return (
        
        <div className="bg-white border rounded-xl p-6">
        
        <p className="text-gray-500 text-sm">
        {title}
        </p>
        
        <p className="text-3xl font-bold mt-2">
        {value}
        </p>
        
        </div>
        
    );
}

import { ChartAreaInteractive } from "@/components/chart-area-interactive";

// app/main/page.tsx
export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-4">
    <div className="w-full bg-cover bg-center p-4 rounded-2xl text-white h-40" style={{ backgroundImage: "url('/bg-dummy.jpg')" }}>
      <p>Selamat Datang di</p>
      <h1 className="text-2xl font-bold text-white">
        Dashboard Admin
      </h1>
    </div>

    <ChartAreaInteractive />
    </section>
  );
}

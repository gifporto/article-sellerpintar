// app/main/page.tsx
export default function LandingPage() {
  return (
     <section className="w-full bg-cover bg-center p-4 rounded-2xl text-white h-44" style={{ backgroundImage: "url('/bg-dummy.jpg')" }}>
      <p>Selamat Datang di</p>
      <h1 className="text-2xl font-bold text-white">
        Landing Page User
      </h1>
    </section>
  );
}

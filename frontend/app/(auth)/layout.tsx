export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-4 py-16">
      <div className="w-full max-w-[440px]">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-[40px] font-normal leading-tight text-off-black">HRMS</h1>
          <p className="mt-2 text-[16px] text-graphite">Every workday, perfectly aligned.</p>
        </div>
        {children}
      </div>
    </main>
  );
}

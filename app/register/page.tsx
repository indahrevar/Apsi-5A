import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 font-sans text-[#303030]">
      <section className="w-full max-w-[420px] rounded-[5px] border border-[#bdbdbd] bg-white px-8 py-10 text-center">
        <h1 className="text-[22px] font-bold leading-7">Daftar</h1>
        <p className="mt-3 text-sm leading-6 text-[#666]">
          Pendaftaran akun belum tersedia. Silakan hubungi administrator.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-[34px] items-center justify-center rounded-full bg-[#303030] px-6 text-[13px] text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#303030]"
        >
          Kembali ke Masuk
        </Link>
      </section>
    </main>
  );
}

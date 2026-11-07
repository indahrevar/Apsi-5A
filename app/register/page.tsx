import Link from "next/link";
import RegisterForm from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8 font-sans text-[#303030]">
      <section className="w-full max-w-[620px] rounded-md border border-[#d6d6d6] bg-white p-6 sm:p-8">
        <Link
          className="text-xs text-[#666] hover:underline"
          href="/login"
        >
          ← Kembali ke Masuk
        </Link>
        <div className="mt-5">
          <h1 className="text-[22px] font-bold">Daftar Customer</h1>
          <div className="mt-2 h-1 w-40 rounded-full bg-[#dedede]" />
          <p className="mt-3 text-sm text-[#777]">
            Lengkapi profil untuk mulai memesan menu Dapur Abita.
          </p>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
}

import Link from "next/link";

function DapurAbitaMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      fill="none"
      viewBox="0 0 440 440"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="220" cy="220" r="219.5" stroke="#573c2b" />
      <path d="M132 127l4 13 13 4-13 4-4 13-4-13-13-4 13-4 4-13z" fill="#573c2b" />
      <path d="M328 146l3 10 10 3-10 3-3 10-3-10-10-3 10-3 3-10z" fill="#573c2b" />
      <path d="M225 156v18" stroke="#D58B42" strokeLinecap="round" strokeWidth="5" />
      <circle cx="220" cy="194" r="22" fill="#B95B3D" />
      <rect x="92" y="210" width="256" height="28" rx="14" fill="#EFE3D5" />
      <path d="M100 238h240v51a9 9 0 0 1-9 9H109a9 9 0 0 1-9-9v-51z" fill="#573c2b" />
      <path d="M116 238h22v28a11 11 0 0 1-22 0v-28zM180 238h22v44a11 11 0 0 1-22 0v-44zM280 238h22v24a11 11 0 0 1-22 0v-24z" fill="#EFE3D5" />
      <rect x="100" y="298" width="240" height="16" rx="8" fill="#EFE3D5" />
      <rect x="100" y="314" width="240" height="56" rx="9" fill="#573c2b" />
      <rect x="70" y="370" width="300" height="14" rx="7" fill="#EFE3D5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffaf3] via-white to-[#f7e7d8] px-5 py-10 text-[#573c2b]">
      <section className="flex w-full max-w-4xl flex-col items-center text-center">
        <div className="aspect-square w-[min(70vw,440px)]">
          <DapurAbitaMark />
        </div>
        <h1 className="mt-8 font-serif text-[clamp(3.5rem,9vw,7rem)] font-bold leading-none tracking-tight">
          Dapur Abita
        </h1>
        <p className="mt-5 text-base font-medium tracking-[0.3em] text-[#92745e] sm:text-2xl">
          BROWNIES &amp; KUE
        </p>
        <Link
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#a84e32] px-8 text-sm font-medium text-white transition hover:bg-[#833c29] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a84e32]"
          href="/login"
        >
          Mulai Pesan
        </Link>
        <p className="mt-4 text-sm text-[#92745e]">
          Sudah terdaftar?{" "}
          <Link className="font-medium text-[#a84e32] underline" href="/login">
            Masuk
          </Link>
        </p>
      </section>
    </main>
  );
}

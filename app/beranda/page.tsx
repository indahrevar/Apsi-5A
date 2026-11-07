import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-content">
        <svg
          aria-label="Ilustrasi kue lapis dengan ceri"
          className="landing-cake"
          role="img"
          viewBox="0 0 320 320"
        >
          <circle className="landing-cake__badge" cx="160" cy="160" r="152" />
          <path
            className="landing-sparkle"
            d="M92 93l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12z"
          />
          <path
            className="landing-sparkle"
            d="M243 109l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9z"
          />
          <rect
            className="landing-cake__plate"
            fill="#e5e5e5"
            height="10"
            rx="5"
            width="218"
            x="51"
            y="262"
          />
          <rect
            className="landing-cake__layer landing-cake__layer--bottom"
            fill="#111"
            height="42"
            rx="8"
            width="172"
            x="74"
            y="222"
          />
          <rect
            className="landing-cake__layer landing-cake__layer--top"
            fill="#111"
            height="42"
            rx="8"
            width="172"
            x="74"
            y="174"
          />
          <rect
            className="landing-cake__icing"
            fill="#e5e5e5"
            height="20"
            rx="10"
            width="184"
            x="68"
            y="157"
          />
          <path
            className="landing-cake__drip"
            d="M86 168h16v26a8 8 0 01-16 0v-26zm46 0h16v36a8 8 0 01-16 0v-36zm71 0h16v24a8 8 0 01-16 0v-24z"
            fill="#e5e5e5"
          />
          <path
            className="landing-cake__cherry"
            d="M163 132v-20"
            fill="none"
            stroke="#d9904a"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <circle className="landing-cake__cherry" cx="160" cy="146" fill="#d94d43" r="16" />
        </svg>
        <h1 className="landing-title">Dapur Abita</h1>
        <p className="landing-subtitle">BROWNIES &amp; KUE</p>
        <div className="landing-actions">
          <Link className="button button--primary" href="/menu">
            Pesan sekarang
          </Link>
          <Link className="button button--outline" href="/">
            Masuk ke akun
          </Link>
        </div>
      </div>
    </main>
  );
}

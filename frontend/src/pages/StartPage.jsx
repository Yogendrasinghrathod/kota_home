import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100">
      <div className="relative w-[375px] h-[812px] overflow-hidden rounded-[8px] bg-gradient-to-b from-[#faf9ff] via-[#f3efff] to-[#cfc4ff] shadow-2xl">




        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center pt-[205px]">

          {/* Home Icon */}
          <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#7656df] shadow-lg shadow-violet-300/50">

            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 10.5L12 3L21 10.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M5.5 9.5V20H18.5V9.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M9.5 20V14H14.5V20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* App Name */}
          <h1 className="mt-4 text-[24px] font-bold tracking-tight text-[#17132d]">
            Kota Home
          </h1>

          {/* Subtitle */}
          <p className="mt-2 text-center text-[11px] leading-[16px] text-[#62578c]">
            Find your perfect PG
            <br />
            in Kota
          </p>
        </div>

        {/* Decorative Clouds */}
        <div className="absolute bottom-[235px] left-0 right-0 opacity-60">

          <svg
            width="100%"
            height="70"
            viewBox="0 0 375 70"
            fill="none"
          >
            <path
              d="M15 48C25 40 35 42 43 48C51 39 65 40 73 48C83 40 96 42 103 50"
              stroke="#b3a7ef"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <path
              d="M270 32C280 25 292 27 298 34C308 24 323 26 330 35C340 27 352 29 360 36"
              stroke="#b3a7ef"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <path
              d="M145 25C150 21 156 21 161 25"
              stroke="#b3a7ef"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* City */}
        <div className="absolute bottom-0 left-0 right-0 h-[285px]">

          <svg
            className="absolute bottom-0 left-0 h-full w-full"
            viewBox="0 0 375 245"
            preserveAspectRatio="none"
          >

            {/* Back Buildings */}
            <g fill="#bcb1ed" opacity="0.55">

              <rect x="0" y="100" width="38" height="145" />

              <rect x="45" y="72" width="30" height="173" />

              <rect x="82" y="115" width="35" height="130" />

              <rect x="125" y="92" width="30" height="153" />

              <rect x="165" y="112" width="38" height="133" />

              <rect x="215" y="75" width="34" height="170" />

              <rect x="260" y="110" width="38" height="135" />

              <rect x="310" y="82" width="30" height="163" />

              <rect x="350" y="105" width="30" height="140" />

            </g>

            {/* Front Buildings */}
            <g fill="#8875dc">

              {/* Left tall building */}
              <rect x="2" y="125" width="45" height="120" />

              <rect x="8" y="115" width="33" height="10" />

              {/* Building */}
              <rect x="55" y="155" width="42" height="90" />

              {/* Center tower */}
              <rect x="105" y="130" width="38" height="115" />

              <polygon
                points="105,130 124,105 143,130"
              />

              {/* Main tall building */}
              <rect x="150" y="112" width="47" height="133" />

              <polygon
                points="150,112 173.5,90 197,112"
              />

              {/* Center small */}
              <rect x="205" y="148" width="40" height="97" />

              {/* Right tower */}
              <rect x="250" y="125" width="43" height="120" />

              <polygon
                points="250,125 271.5,103 293,125"
              />

              {/* Right buildings */}
              <rect x="300" y="155" width="35" height="90" />

              <rect x="340" y="135" width="45" height="110" />

            </g>

            {/* Windows */}
            <g fill="#eeeaff" opacity="0.85">

              {/* Left */}
              <rect x="12" y="140" width="6" height="8" />
              <rect x="27" y="140" width="6" height="8" />

              <rect x="12" y="158" width="6" height="8" />
              <rect x="27" y="158" width="6" height="8" />

              <rect x="12" y="176" width="6" height="8" />
              <rect x="27" y="176" width="6" height="8" />

              {/* Center */}
              <rect x="160" y="130" width="7" height="9" />
              <rect x="181" y="130" width="7" height="9" />

              <rect x="160" y="150" width="7" height="9" />
              <rect x="181" y="150" width="7" height="9" />

              <rect x="160" y="170" width="7" height="9" />
              <rect x="181" y="170" width="7" height="9" />

              <rect x="160" y="190" width="7" height="9" />
              <rect x="181" y="190" width="7" height="9" />

              {/* Right */}
              <rect x="260" y="143" width="6" height="8" />
              <rect x="278" y="143" width="6" height="8" />

              <rect x="260" y="161" width="6" height="8" />
              <rect x="278" y="161" width="6" height="8" />

              <rect x="260" y="179" width="6" height="8" />
              <rect x="278" y="179" width="6" height="8" />

            </g>

            {/* Ground */}
            <rect
              x="0"
              y="240"
              width="375"
              height="5"
              fill="#7564ca"
              opacity="0.45"
            />

          </svg>
        </div>

      </div>
    </div>
  );
}
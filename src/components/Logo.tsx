export function LogoText(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
    >
      <image
        href="https://einfachalex.net/storage/2023/09/d40d35b3063c11244fbf38e9b55074be.png"
        width="300"
        height="100"
      />
    </svg>
  );
}

export function Logo(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
    >
      <defs>
        <pattern id="image" x="0" y="0" patternUnits="userSpaceOnUse" width="300" height="100">
          <image href="https://einfachalex.net/storage/2023/09/d40d35b3063c11244fbf38e9b55074be.png" width="100" height="100" />
        </pattern>
      </defs>
      <path
        fill={`url(#image)`}
        d="M0 0h100v100H0z"
      />
    </svg>
  );
}

export function LogoIcon(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 118 117"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M117 26.7A26.7 26.7 0 0 0 90.3 0H27.09A26.7 26.7 0 0 0 .38 26.7v63.23a26.7 26.7 0 0 0 26.7 26.7h66.74a23.18 23.18 0 0 0 23.19-23.19V26.7ZM35.5 70.26V11.24h-8.42A15.46 15.46 0 0 0 11.62 26.7v43.56h23.89ZM11.63 81.5h59.02v23.89H27.08a15.46 15.46 0 0 1-15.46-15.46V81.5Zm94.14-46.37H46.74V11.24h43.57c8.53 0 15.45 6.92 15.45 15.46v8.43Zm-23.88 70.25V46.37h23.88v47.07c0 6.6-5.34 11.95-11.94 11.95H81.88Z"
        fill="url(#a)"
      />
      <defs>
        <linearGradient
          id="a"
          x1={59}
          y1={-12.54}
          x2={59}
          y2={116.46}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#41E094" />
          <stop offset={1} stopColor="#27B882" />
        </linearGradient>
      </defs>
    </svg>
  );
}

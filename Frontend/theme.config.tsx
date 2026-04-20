import React from 'react'
import DashCodeLogo from '@/components/dascode-logo';

const config = {
  logo: (
    <span className="inline-flex gap-2.5 items-center">
      <DashCodeLogo className="text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
      <span className="text-lg font-bold text-default">Dashcode</span>
    </span>
  ),
  project: {
    link: "https://github.com/shuding/nextra",
  },
  banner: {
    key: "1.0-release",
    text: (
      <a href="/dashboard" target="_blank">
        🎉 Dashcode
      </a>
    ),
  },
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{" "}
        <a href="https://codeshaper.net/" target="_blank">
          CodeShaper
        </a>
        .
      </span>
    ),
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Dashcode" />
      <meta property="og:description" content="Dashcode is a popular dashboard template." />
    </>
  ),
};

export default config
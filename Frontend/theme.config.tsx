import React from 'react';
import { BrandLogo } from '@/components/brand-logo';

const config = {
  logo: (
    <span className="inline-flex gap-2.5 items-center">
      <BrandLogo symbolClassName="size-8" />
    </span>
  ),
  project: {
    link: "https://github.com",
  },
  banner: {
    key: "1.0-release",
    text: (
      <a href="/dashboard" target="_blank">
        EZQueue Platform
      </a>
    ),
  },
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} © EZQueue Platform. All rights reserved.
      </span>
    ),
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="EZQueue Documentation" />
      <meta property="og:description" content="EZQueue Queue and Booking Management Platform" />
    </>
  ),
};

export default config;

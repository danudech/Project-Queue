import React from 'react'
import { Metadata } from 'next'
export default function NotFound() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <p className="mt-2 text-neutral-600">
        The requested page does not exist.
      </p>
    </div>
  );
};

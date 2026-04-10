"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function PatientHomePreview() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">{t("nav.home") || "Home"}</span>
            <span className="block text-blue-600">
              Your Smile, Our Priority
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Welcome to DentilFlow Patient Portal. Seamlessly browse your
            appointments, check your history, and stay in touch with your
            clinic. Change the language above, or toggle the theme to test the
            responsive mobile header framework.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Book Appointment
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ms-3">
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                My Profile
              </a>
            </div>
          </div>
        </section>

        {/* Feature Grid to test scroll and spacing */}
        <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-8 pb-32">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8 h-full transition-transform hover:scale-105">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      {/* Icon placeholder */}
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                    Feature {i + 1}
                  </h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Ac tincidunt sapien vehicula erat auctor pellentesque
                    rhoncus. Et magna sit morbi lobortis.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

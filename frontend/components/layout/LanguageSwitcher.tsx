'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Globe, Check } from 'lucide-react';
import {
  useLanguage,
  Language,
} from '@/app/providers/LanguageProvider';

function LanguageSwitcherContent() {
  const { language, setLanguage, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: {
    code: Language;
    name: string;
    native: string;
    flag: string;
  }[] = [
    {
      code: 'en',
      name: 'English',
      native: 'English',
      flag: '🇬🇧',
    },
    {
      code: 'hi',
      name: 'Hindi',
      native: 'हिन्दी',
      flag: '🇮🇳',
    },
    {
      code: 'gu',
      name: 'Gujarati',
      native: 'ગુજરાતી',
      flag: '🇮🇳',
    },
  ];

  const currentLanguage = languages.find(
    (lang) => lang.code === language
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
        title={t('nav.changeLanguage')}
        aria-label={t('nav.changeLanguage')}
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />

        <span className="text-xs font-medium">
          {currentLanguage?.flag}{' '}
          {currentLanguage?.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[1000] mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                language === lang.code
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {lang.flag}
                </span>

                <div>
                  <p className="text-sm font-medium">
                    {lang.native}
                  </p>

                  <p className="text-xs text-slate-500">
                    {lang.name}
                  </p>
                </div>
              </div>

              {language === lang.code && (
                <Check className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LanguageSwitcher() {
  return (
    <Suspense
      fallback={
        <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
      }
    >
      <LanguageSwitcherContent />
    </Suspense>
  );
}
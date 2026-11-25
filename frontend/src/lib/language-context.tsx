'use client';

import React, { createContext, useContext, useState } from 'react';
import { Language } from './types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const UI_TRANSLATIONS: Record<string, Record<Language, string>> = {
  appName: {
    en: 'LEXORA',
    kn: 'ಲೆಕ್ಸೋರಾ',
    hi: 'लेक्सोरा',
  },
  tagline: {
    en: 'Understand Your Rights. Understand Your Documents.',
    kn: 'ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ. ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
    hi: 'अपने अधिकार समझें। अपने दस्तावेज़ समझें।',
  },
  navHome: {
    en: 'Home',
    kn: 'ಮುಖಪುಟ',
    hi: 'होम',
  },
  navDashboard: {
    en: 'Dashboard',
    kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    hi: 'डैशबोर्ड',
  },
  navUpload: {
    en: 'Upload Document',
    kn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್',
    hi: 'दस्तावेज़ अपलोड',
  },
  navRiskCenter: {
    en: 'Risk Detection',
    kn: 'ಅಪಾಯ ಪತ್ತೆ',
    hi: 'जोखिम पहचान',
  },
  navMissingClauses: {
    en: 'Missing Clauses',
    kn: 'ಕಾಣೆಯಾದ ಷರತ್ತುಗಳು',
    hi: 'लापता खंड',
  },
  navAssistant: {
    en: 'AI Assistant',
    kn: 'ಎಐ ಸಹಾಯಕ',
    hi: 'एआई सहायक',
  },
  btnAnalyze: {
    en: 'Analyze Document',
    kn: 'ದಾಖಲೆ ವಿಶ್ಲೇಷಿಸಿ',
    hi: 'दस्तावेज़ का विश्लेषण करें',
  },
  btnDownloadReport: {
    en: 'Download Legal Brief',
    kn: 'ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    hi: 'रिपोर्ट डाउनलोड करें',
  },
  disclaimer: {
    en: 'Educational citizen information only. Not formal legal advice.',
    kn: 'ಶೈಕ್ಷಣಿಕ ನಾಗರಿಕ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಅಧಿಕೃತ ಕಾನೂನು ಸಲಹೆಯಲ್ಲ.',
    hi: 'केवल शैक्षिक नागरिक सूचना के लिए। औपचारिक कानूनी सलाह नहीं।',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lexora_lang', lang);
    }
  };

  const t = (key: string): string => {
    return UI_TRANSLATIONS[key]?.[language] || UI_TRANSLATIONS[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}

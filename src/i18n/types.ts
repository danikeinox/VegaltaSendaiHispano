export type Dictionary = {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    ogDescription: string;
    ogImageAlt: string;
  };
  language: {
    label: string;
    es: string;
    jp: string;
  };
  nav: {
    home: string;
    register: string;
    benefits: string;
    about: string;
    telegram: string;
    openMenu: string;
    closeMenu: string;
  };
  about: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    subtitle: string;
    sections: Array<{ heading: string; paragraphs: string[] }>;
    ctaRegister: string;
    ctaTelegram: string;
    ctaAnthem: string;
    backHome: string;
  };
  hero: {
    tagline: string;
    taglineSecondary: string;
    description: string;
    unofficial: string;
  };
  benefits: {
    title: string;
    subtitle: string;
    items: Array<{ title: string; description: string }>;
  };
  headline: {
    label: string;
    text: string;
    appleWallet: string;
    googleWallet: string;
  };
  anthem: {
    title: string;
    subtitle: string;
    description: string;
    watchOnYoutube: string;
    fanmadeNote: string;
    videoTitle: string;
  };
  register: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    countryOptional: string;
    submit: string;
    submitting: string;
    disclaimer: string;
    welcomeNew: string;
    welcomeExisting: string;
    addAppleWallet: string;
    addGoogleWallet: string;
    downloadAndroid: string;
    registerAnother: string;
    connectionError: string;
    registerError: string;
    appleUnavailable: string;
  };
  carnet: {
    title: string;
    subtitle: string;
    country: string;
    memberSince: string;
    backHome: string;
    officialCard: string;
  };
  footer: {
    description: string;
    links: string;
    home: string;
    about: string;
    getCard: string;
    officialWeb: string;
    telegramMembers: string;
    legal: string;
    legalText: string;
    copyright: string;
  };
  telegram: {
    join: string;
    joinNav: string;
    ariaLabel: string;
  };
  notFound: {
    label: string;
    message: string;
    backHome: string;
  };
  common: {
    communitySubtitle: string;
    logoAlt: string;
  };
  validation: {
    firstNameRequired: string;
    firstNameInvalid: string;
    lastNameRequired: string;
    lastNameInvalid: string;
    emailInvalid: string;
    countryInvalid: string;
    displayIdInvalid: string;
  };
  api: {
    forbiddenOrigin: string;
    rateLimited: string;
    capacityFull: string;
    dailyQuotaFull: string;
    validationError: string;
    internalError: string;
  };
};

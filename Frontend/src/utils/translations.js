import { useContext } from "react";
import { AppContext } from "../contexts/AppContext";

const dictionary = {
  en: {
    appName: "CivicReport",
    home: "Home",
    dashboard: "Dashboard",
    create: "Create",
    profile: "Profile",
    settings: "Settings",
    alerts: "Alerts",
    search: "Search",
    reportIssue: "Report Issue",
    manageIssues: "Manage Issues",
    notifications: "Notifications",
    language: "Language",
    english: "English",
    nepali: "नेपाली",
    toggleLanguage: "Switch language",
    signIn: "Sign in",
    signOut: "Sign out",
    searchResults: "Search Results",
    showingResults: "Showing results for \"{query}\"",
    enterSearchTerm: "Enter a search term",
    startSearching: "Start searching",
    noResultsFound: "No results found",
    tryDifferent: "Try searching with different keywords or check your spelling.",
    notificationTitle: "Notifications",
    markAllRead: "Mark all read",
    clearAll: "Clear all",
    noNotifications: "No notifications yet.",
    comment: "Comment",
    upvote: "Upvote",
    downvote: "Downvote",
    statusUpdate: "Status Update",
    viewDetails: "View details",
  },
  ne: {
    appName: "सिभिकरिपोर्ट",
    home: "गृहपृष्ठ",
    dashboard: "ड्यासबोर्ड",
    create: "सिर्जना",
    profile: "प्रोफाइल",
    settings: "सेटिङहरू",
    alerts: "सूचनाहरू",
    search: "खोज",
    reportIssue: "समस्या रिपोर्ट गर्नुहोस्",
    manageIssues: "समस्याहरू व्यवस्थापन गर्नुहोस्",
    notifications: "सूचनाहरू",
    language: "भाषा",
    english: "English",
    nepali: "नेपाली",
    toggleLanguage: "भाषा परिवर्तन गर्नुहोस्",
    signIn: "साइन इन",
    signOut: "लग आउट",
    searchResults: "खोज परिणामहरू",
    showingResults: "\"{query}\" को लागि परिणामहरू देखाइँदै",
    enterSearchTerm: "खोज शब्द प्रविष्ट गर्नुहोस्",
    startSearching: "खोज सुरु गर्नुहोस्",
    noResultsFound: "कुनै परिणाम फेला परेन",
    tryDifferent: "विभिन्न कुञ्जीशब्दहरू प्रयोग गर्नुहोस् वा तपाईंको वर्तनी जाँच गर्नुहोस्।",
    notificationTitle: "सूचनाहरू",
    markAllRead: "सबै पढियो",
    clearAll: "सबै मेटाउनुहोस्",
    noNotifications: "अझै कुनै सूचना छैन।",
    comment: "टिप्पणी",
    upvote: "अपभोट",
    downvote: "डाउनभोट",
    statusUpdate: "स्थिति अपडेट",
    viewDetails: "विवरण हेर्नुहोस्",
  },
};

export const useTranslation = () => {
  const { language } = useContext(AppContext);

  return (key, params = {}) => {
    const value = dictionary[language]?.[key] || dictionary.en[key] || key;
    return Object.keys(params).reduce(
      (text, param) => text.replace(new RegExp(`\\{${param}\\}`, "g"), params[param]),
      value,
    );
  };
};

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
    appearance: "Appearance",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    defaultDeviceMode: "Default device mode",
    themeAndDisplay: "Theme and display",
    selectTheme: "Select a theme",
    report: "Report",
    publicFeed: "Public",
    authorityFeed: "Authority",
    communityFeed: "Community Feed",
    governmentPortal: "Government Portal",
    quickActions: "Quick Actions",
    viewDashboard: "View Dashboard",
    noRecentNotifications: "No recent notifications.",
    recentNotifications: "Recent notifications",
    governmentOfficial: "Government Official",
    citizen: "Citizen",
    personalInformation: "Personal information",
    privacyAndSecurity: "Privacy & Security",
    permissions: "Permissions",
    pushAndEmailAlerts: "Push and email alerts",
    account: "Account",
    logOut: "Log out",
    logOutQuestion: "Log out?",
    logOutMessage: "Are you sure you want to log out of your account?",
    cancel: "Cancel",
    save: "Save",
    loading: "Loading...",
    markRead: "Mark read",
    noResults: "No results",
    reportAnIssue: "Report an Issue",
    manageIssuesTitle: "Manage Issues",
    noIssuesYet: "No issues reported yet",
    noAuthorityUpdatesYet: "No authority updates yet",
    sharedReportNotFound: "Shared report not found",
    sharedReportInvalid: "This link may be invalid or the report was removed.",
    publicFeedEmpty: "Be the first to report a civic issue in your community.",
    authorityFeedEmpty: "Issues handled or updated by authorities will appear here.",
    moreReports: "More reports",
    comments: "Comments",
    replies: "Replies",
    viewReplies: "View replies",
    writeComment: "Write a comment...",
    writeReply: "Write a reply...",
    noCommentsYet: "No comments yet. Start the conversation.",
    reportIssueCTA: "Report an Issue",
    community: "Community",
    insights: "Insights",
    statusLabel: "Status",
    allStatuses: "All statuses",
    ward: "Ward",
    allWards: "All wards",
    issueType: "Issue type",
    allTypes: "All types",
    searchPlaceholder: "Title, keyword…",
    matchingReports: "{count} matching reports",
    allReports: "All reports",
    totalReportsStat: "Total reports",
    noReportsMatchFilters: "No reports match your filters.",
    filedLast24h: "{count} filed in the last 24 hrs",
    total: "Total",
    clearFilters: "Clear filters",
    issueActivity: "Issue activity",
    communityIssue: "Community issue",
    general: "General",
    approval: "Approval",
    positiveBasedOnVotes: "positive based on votes",
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
    appearance: "देखावट",
    theme: "थीम",
    light: "उज्यालो",
    dark: "गाढा",
    system: "सिस्टम",
    defaultDeviceMode: "डिभाइसको पूर्वनिर्धारित मोड",
    themeAndDisplay: "थीम र प्रदर्शन",
    selectTheme: "थीम चयन गर्नुहोस्",
    report: "रिपोर्ट",
    publicFeed: "सार्वजनिक",
    authorityFeed: "अधिकार",
    communityFeed: "समुदाय फिड",
    governmentPortal: "सरकारी पोर्टल",
    quickActions: "छिटो कार्यहरू",
    viewDashboard: "ड्यासबोर्ड हेर्नुहोस्",
    noRecentNotifications: "हालको कुनै सूचना छैन।",
    recentNotifications: "हालको सूचनाहरू",
    governmentOfficial: "सरकारी अधिकारी",
    citizen: "नागरिक",
    personalInformation: "व्यक्तिगत जानकारी",
    privacyAndSecurity: "गोपनीयता र सुरक्षा",
    permissions: "अनुमतिहरू",
    pushAndEmailAlerts: "पुश र ईमेल सूचना",
    account: "खाता",
    logOut: "लगआउट",
    logOutQuestion: "लगआउट?",
    logOutMessage: "के तपाईं आफ्नो खाता लगआउट गर्न निश्चित हुनुहुन्छ?",
    cancel: "रद्द गर्नुहोस्",
    save: "सेभ गर्नुहोस्",
    loading: "लोड हुँदै...",
    markRead: "पढेको चिन्ह लगाउनुहोस्",
    noResults: "कुनै परिणाम छैन",
    reportAnIssue: "समस्या रिपोर्ट गर्नुहोस्",
    manageIssuesTitle: "समस्याहरू व्यवस्थापन गर्नुहोस्",
    noIssuesYet: "अझै कुनै समस्या रिपोर्ट गरिएको छैन",
    noAuthorityUpdatesYet: "अझै कुनै अधिकार अपडेटहरू छैनन्",
    sharedReportNotFound: "साझा गरिएको रिपोर्ट फेला परेन",
    sharedReportInvalid: "यो लिङ्क अमान्य हुन सक्छ वा रिपोर्ट हटाइएको हुन सक्छ।",
    publicFeedEmpty: "आफ्नो समुदायमा पहिलो नागरिक समस्या रिपोर्ट गर्नुहोस्।",
    authorityFeedEmpty: "सरकारद्वारा व्यवस्थापन गरिएको समस्या यहाँ देखिनेछ।",
    moreReports: "थप रिपोर्टहरू",
    comments: "टिप्पणीहरू",
    replies: "जवाफहरू",
    viewReplies: "जवाफहरू हेर्नुहोस्",
    writeComment: "टिप्पणी लेख्नुहोस्...",
    writeReply: "जवाफ लेख्नुहोस्...",
    noCommentsYet: "अझै कुनै टिप्पणी छैन। संवाद सुरु गर्नुहोस्।",
    reportIssueCTA: "समस्या रिपोर्ट गर्नुहोस्",
    community: "समुदाय",
    insights: "इनसाइट्स",
    statusLabel: "स्थिति",
    allStatuses: "सबै अवस्थाहरू",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    issueType: "समस्या प्रकार",
    allTypes: "सबै प्रकार",
    searchPlaceholder: "शीर्षक, कुञ्जीशब्द…",
    matchingReports: "{count} मिल्ने रिपोर्टहरू",
    allReports: "सबै रिपोर्टहरू",
    totalReportsStat: "कुल रिपोर्टहरू",
    noReportsMatchFilters: "कुनै रिपोर्टहरूले फिल्टर मेल खाएनन्।",
    filedLast24h: "{count} पछिल्लो २४ घण्टामा दर्ता भएका",
    total: "कुल",
    clearFilters: "फिल्टरहरू हटाउनुहोस्",
    issueActivity: "समस्या गतिविधि",
    communityIssue: "समुदायको समस्या",
    general: "सामान्य",
    approval: "स्वीकृति",
    positiveBasedOnVotes: "भोटहरूमा आधारित सकारात्मक",
    translate: "अनुवाद गर्नुहोस्",
    showOriginal: "मूल देखाउनुहोस्",
    showTranslation: "अनुवाद देखाउनुहोस्",
    showMore: "थप देखाउनुहोस्",
    showLess: "कम देखाउनुहोस्",
    deleteReportQuestion: "रिपोर्ट मेट्ने?",
    deleteActionConfirm: "यो कार्य पूर्ववत गर्न सकिन्न।",
    cancel: "रद्द गर्नुहोस्",
    delete: "मेटाउनुहोस्",
    reportsLabel: "रिपोर्टहरू",
    upvotesLabel: "अपभोट",
    downvotesLabel: "डाउनभोट",
    noReportsYet: "अझै कुनै रिपोर्ट छैन",
    yourSubmittedWillAppear: "तपाईंले पठाउनुभएको समस्या यहाँ देखिनेछ।",
  },
};

// Naive, local, dictionary-based translator (best-effort).
export const translateText = (text, target = "ne") => {
  if (!text || target !== "ne") return text;

  // Phrase-level replacements from dictionary
  let out = String(text);
  const engEntries = Object.entries(dictionary.en).sort((a, b) => b[1].length - a[1].length);
  for (const [, engVal] of engEntries) {
    if (!engVal || typeof engVal !== "string") continue;
    const neKey = Object.keys(dictionary.ne).find((k) => dictionary.en[k] === engVal || dictionary.ne[k]);
    const neVal = neKey ? dictionary.ne[neKey] : null;
    if (neVal) {
      const re = new RegExp(engVal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      out = out.replace(re, neVal);
    }
  }

  // Word-level fallback: map exact word matches from english values to nepali where possible
  const words = out.split(/(\s+|[.,!?;:\-()"'])/g);
  for (let i = 0; i < words.length; i++) {
    const w = words[i].trim();
    if (!w) continue;
    // try to find english entry equal to this word (case-insensitive)
    const key = Object.keys(dictionary.en).find((k) => dictionary.en[k].toLowerCase() === w.toLowerCase());
    if (key && dictionary.ne[key]) {
      words[i] = words[i].replace(new RegExp(w, "i"), dictionary.ne[key]);
    }
  }
  out = words.join("");

  return out;
};

export const getCachedTranslation = (id) => {
  try {
    const raw = localStorage.getItem("__translations_cache_v1");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj[id] || null;
  } catch (e) {
    return null;
  }
};

export const setCachedTranslation = (id, payload) => {
  try {
    const raw = localStorage.getItem("__translations_cache_v1");
    const obj = raw ? JSON.parse(raw) : {};
    obj[id] = { ...(obj[id] || {}), ...payload };
    localStorage.setItem("__translations_cache_v1", JSON.stringify(obj));
  } catch (e) {
    // ignore
  }
};

export const useTranslation = () => {
  const { language } = useContext(AppContext);

  return (key, params = {}) => {
    const value = dictionary[language]?.[key] || dictionary.en[key] || key;
    return Object.keys(params).reduce(
      (text, param) => text.replace(new RegExp(`\{${param}\}`, "g"), params[param]),
      value,
    );
  };
};

import { sharedTranslations, mergeTranslations, type Translations } from "best-time-ui";

const siteTranslations: Translations = {
  en: {
    appName: "Best Walk Time",
    appNameSub: "הזמן הטוב לטיול",
    walkDuration: "Walk Duration",
    location: "Your Location",
    locateMe: "Locate me",
    locating: "Locating...",
    locationError: "Could not get location",
    locationDenied: "Location access denied. Enable it in browser settings.",
    nearestShelter: "Nearest Shelter",
    shelters: "Nearby Shelters",
    noShelters: "No shelter data available",
    loadingShelters: "Loading shelters...",
    walkTime: "walk",
    region: "Region",
    regionChange: "change",
    dataSource: "Alert data: Tzeva Adom / Pikud HaOref — Shelter data: Municipal open data (TLV, Haifa, Jerusalem, Beer Sheva) + OpenStreetMap",
    shelterLimitedCoverage: "Shelter data is currently available for Tel Aviv, Haifa, Jerusalem, and Beer Sheva. Shelters shown for other areas are from OpenStreetMap and may be incomplete.",
    howItWorksContent:
      "This app analyzes real-time rocket alert data from Pikud HaOref combined with public bomb shelter locations to estimate the safest times for a walk. The safety score factors in time since the last alert, alert frequency trends, and your distance to the nearest public shelter.",
  },
  he: {
    appName: "הזמן הטוב לטיול",
    appNameSub: "Best Walk Time",
    walkDuration: "משך הטיול",
    location: "המיקום שלך",
    locateMe: "אתר אותי",
    locating: "מאתר...",
    locationError: "לא ניתן לקבל מיקום",
    locationDenied: "הגישה למיקום נחסמה. הפעילו בהגדרות הדפדפן.",
    nearestShelter: "מקלט קרוב",
    shelters: "מקלטים בסביבה",
    noShelters: "אין נתוני מקלטים",
    loadingShelters: "טוען מקלטים...",
    walkTime: "הליכה",
    region: "אזור",
    regionChange: "שנה",
    dataSource: "נתוני התרעות: צבע אדום / פיקוד העורף — מקלטים: נתונים פתוחים עירוניים (ת״א, חיפה, י-ם, ב״ש) + OpenStreetMap",
    shelterLimitedCoverage: "נתוני מקלטים זמינים כרגע לתל אביב, חיפה, ירושלים ובאר שבע. מקלטים באזורים אחרים מבוססים על OpenStreetMap ועשויים להיות חלקיים.",
    howItWorksContent:
      "האפליקציה מנתחת נתוני התרעות בזמן אמת מפיקוד העורף בשילוב מיקומי מקלטים ציבוריים כדי להעריך את הזמנים הבטוחים ביותר לטיול. ציון הבטיחות מבוסס על הזמן מאז ההתרעה האחרונה, מגמות תדירות, והמרחק שלך מהמקלט הציבורי הקרוב.",
  },
};

export const translations = mergeTranslations(sharedTranslations, siteTranslations);

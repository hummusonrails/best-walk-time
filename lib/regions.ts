export interface Region {
  id: string;
  nameEn: string;
  nameHe: string;
  patterns: string[];
  bounds?: { lat: [number, number]; lng: [number, number] };
}

export const regions: Region[] = [
  {
    id: "all",
    nameEn: "All Israel",
    nameHe: "כל הארץ",
    patterns: [],
  },
  {
    id: "western-galilee",
    nameEn: "Western Galilee",
    nameHe: "גליל מערבי",
    patterns: [
      "נהריה", "עכו", "שלומי", "מעלות", "תרשיחא", "כברי", "מצובה",
      "חניתה", "שומרה", "אדמית", "גורנות הגליל", "גורן", "ערב אל עראמשה",
      "בצת", "לימן", "מזרעה", "בוסתן הגליל", "רגבה", "כפר ורדים",
      "מעיליא", "ירכא", "ג'דיידה", "אבו סנאן", "יאנוח",
    ],
    bounds: { lat: [32.85, 33.1], lng: [35.0, 35.35] },
  },
  {
    id: "upper-galilee",
    nameEn: "Upper Galilee",
    nameHe: "גליל עליון",
    patterns: [
      "צפת", "ראש פינה", "חצור הגלילית", "קריית שמונה", "מטולה",
      "כפר בלום", "דפנה", "שדה נחמיה", "הגושרים", "מנרה",
      "אביבים", "יפתח", "דישון", "מרגליות", "אילון", "פרוד",
      "עמוקה", "ביריה", "כנף", "מירון",
    ],
    bounds: { lat: [32.9, 33.33], lng: [35.35, 35.7] },
  },
  {
    id: "lower-galilee",
    nameEn: "Lower Galilee",
    nameHe: "גליל תחתון",
    patterns: [
      "טבריה", "כרמיאל", "סח'נין", "עראבה", "דיר חנא",
      "מגדל העמק", "נצרת", "נוף הגליל", "שפרעם", "עילבון",
      "כפר כנא", "טורעאן", "עין מאהל", "ריינה", "כפר מנדא",
      "משהד", "יפיע", "דבורייה", "אכסאל",
    ],
    bounds: { lat: [32.6, 32.9], lng: [35.15, 35.55] },
  },
  {
    id: "haifa",
    nameEn: "Haifa & Krayot",
    nameHe: "חיפה והקריות",
    patterns: [
      "חיפה", "קריית אתא", "קריית ביאליק", "קריית ים",
      "קריית מוצקין", "קריית חיים", "קריית שמואל", "נשר",
      "טירת כרמל", "רכסים", "עוספיה", "דלית אל כרמל",
    ],
    bounds: { lat: [32.7, 32.87], lng: [34.94, 35.15] },
  },
  {
    id: "jezreel",
    nameEn: "Jezreel Valley",
    nameHe: "עמק יזרעאל",
    patterns: [
      "עפולה", "יקנעם", "בית שאן", "בית אלפא", "גלבוע",
      "מגידו", "רמת ישי", "אלון הגליל", "קריית טבעון",
      "כפר יהושע", "נהלל", "שדה יעקב", "מרחביה", "בלפוריה",
    ],
    bounds: { lat: [32.4, 32.7], lng: [35.15, 35.55] },
  },
  {
    id: "golan",
    nameEn: "Golan Heights",
    nameHe: "רמת הגולן",
    patterns: [
      "קצרין", "אל רום", "מרום גולן", "אניעם", "חספין",
      "בני יהודה", "גבעת יואב", "רמת מגשימים", "מבוא חמה",
      "נאות גולן", "אורטל", "אודם", "נמרוד",
    ],
    bounds: { lat: [32.6, 33.33], lng: [35.6, 35.95] },
  },
  {
    id: "sharon",
    nameEn: "Sharon",
    nameHe: "השרון",
    patterns: [
      "נתניה", "הרצליה", "כפר סבא", "רעננה", "הוד השרון",
      "רמת השרון", "כפר שמריהו", "כפר יונה", "אבן יהודה",
      "תל מונד", "חדרה", "פרדס חנה", "כרכור", "זכרון יעקב",
      "בנימינה", "קיסריה", "אור עקיבא", "בית ברל",
    ],
    bounds: { lat: [32.16, 32.55], lng: [34.75, 35.0] },
  },
  {
    id: "gush-dan",
    nameEn: "Tel Aviv & Gush Dan",
    nameHe: "תל אביב וגוש דן",
    patterns: [
      "תל אביב", "רמת גן", "גבעתיים", "בני ברק", "פתח תקווה",
      "חולון", "בת ים", "ראשון לציון", "גבעת שמואל",
      "אור יהודה", "קריית אונו", "יהוד", "סביון", "אזור",
    ],
    bounds: { lat: [32.0, 32.16], lng: [34.73, 34.88] },
  },
  {
    id: "center",
    nameEn: "Central",
    nameHe: "מרכז",
    patterns: [
      "מודיעין", "רמלה", "לוד", "נס ציונה", "רחובות",
      "יבנה", "גדרה", "בית שמש", "שוהם", "אלעד", "ראש העין",
      "פתח תקווה", "כפר קאסם", "טייבה", "קלנסוואה",
    ],
    bounds: { lat: [31.8, 32.1], lng: [34.82, 35.1] },
  },
  {
    id: "jerusalem",
    nameEn: "Jerusalem",
    nameHe: "ירושלים",
    patterns: [
      "ירושלים", "מעלה אדומים", "גבעת זאב", "מבשרת ציון",
      "אבו גוש", "צור הדסה", "בית שמש", "מוצא",
    ],
    bounds: { lat: [31.7, 31.87], lng: [35.1, 35.3] },
  },
  {
    id: "shfela",
    nameEn: "Shfela (Lowlands)",
    nameHe: "שפלה",
    patterns: [
      "אשדוד", "גן יבנה", "קריית גת", "קריית מלאכי",
      "גדרה", "יבנה", "בית קמה", "לכיש", "שדרות",
    ],
    bounds: { lat: [31.55, 31.85], lng: [34.55, 34.85] },
  },
  {
    id: "south-coast",
    nameEn: "Ashkelon Coast",
    nameHe: "חוף אשקלון",
    patterns: [
      "אשקלון", "ניצנים", "זיקים", "כרמיה", "יד מרדכי",
      "ברנע", "מגדל", "בית שקמה",
    ],
    bounds: { lat: [31.55, 31.7], lng: [34.5, 34.6] },
  },
  {
    id: "negev",
    nameEn: "Negev",
    nameHe: "נגב",
    patterns: [
      "באר שבע", "אופקים", "נתיבות", "שדרות", "ערד",
      "דימונה", "ירוחם", "מצפה רמון", "רהט", "כסייפה",
      "תל ערד", "ערערה בנגב", "לקיה", "חורה", "שגב שלום",
      "אבו תלול", "אבו קרינאת", "עומר", "מיתר", "להבים",
    ],
    bounds: { lat: [30.6, 31.5], lng: [34.4, 35.3] },
  },
  {
    id: "gaza-envelope",
    nameEn: "Gaza Envelope",
    nameHe: "עוטף עזה",
    patterns: [
      "שדרות", "סדרות", "נתיב העשרה", "ארז", "כרם שלום",
      "כיסופים", "עין השלושה", "ניר עוז", "נחל עוז",
      "מפלסים", "אשכול", "בארי", "רעים", "אופקים",
      "נירים", "עלומים", "תקומה", "גבים", "דורות",
    ],
    bounds: { lat: [31.2, 31.55], lng: [34.2, 34.6] },
  },
  {
    id: "eilat",
    nameEn: "Eilat & Arava",
    nameHe: "אילת והערבה",
    patterns: [
      "אילת", "יהל", "לוטן", "קטורה", "באר אורה",
      "שחרות", "אליפז", "נאות סמדר", "עין יהב", "ספיר",
    ],
    bounds: { lat: [29.45, 30.6], lng: [34.9, 35.4] },
  },
];

export function detectRegionFromCoordinates(lat: number, lng: number): string {
  for (const region of regions) {
    if (!region.bounds) continue;
    const [latMin, latMax] = region.bounds.lat;
    const [lngMin, lngMax] = region.bounds.lng;
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
      return region.id;
    }
  }
  return "all";
}

export function filterAlertsByRegion(
  cities: string[],
  regionId: string
): boolean {
  if (regionId === "all") return true;

  const region = regions.find((r) => r.id === regionId);
  if (!region) return true;

  return cities.some((city) =>
    region.patterns.some((pattern) => city.includes(pattern))
  );
}

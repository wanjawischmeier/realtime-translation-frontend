// Country codes for languages expected to be compatible with libretranslate
// TODO: maybe don't use something static like this
const languageNames = {
  ar: "Arabic",
  az: "Azerbaijani",
  bg: "Bulgarian",
  bn: "Bengali",
  ca: "Catalan",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  eo: "Esperanto",
  es: "Spanish",
  et: "Estonian",
  eu: "Basque",
  fa: "Persian",
  fi: "Finnish",
  fr: "French",
  ga: "Irish",
  gl: "Galician",
  he: "Hebrew",
  hi: "Hindi",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  ky: "Kyrgyz",
  lt: "Lithuanian",
  lv: "Latvian",
  ms: "Malay",
  nb: "Norwegian Bokmål",
  nl: "Dutch",
  "pt-BR": "Portuguese (Brazil)",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovene",
  sq: "Albanian",
  sr: "Serbian",
  sv: "Swedish",
  th: "Thai",
  tl: "Tagalog",
  tr: "Turkish",
  uk: "Ukrainian",
  ur: "Urdu",
  vi: "Vietnamese",
  "zh-Hans": "Chinese (Simplified)",
  "zh-Hant": "Chinese (Traditional)",
};

export default function LanguageSelect({customClassName=false, lang, setLang, languages }) {
  return (
    <select
      className={customClassName ? customClassName : "px-4 p-2 box-border rounded-lg bg-gray-700 text-gray-100 w-full"}
      value={lang}
      onChange={e => setLang(e.target.value)}
    >
      {languages.map(code => (
        <option key={code} value={code}>
          {languageNames[code] || code}
        </option>
      ))}
    </select>
  );
}

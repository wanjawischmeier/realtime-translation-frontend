import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

i18next
  .use(Backend)                     // Connects the file system backend
  .use(middleware.LanguageDetector) // Enables automatic language detection
  .init({
    backend: {
      loadPath: path.join(process.cwd(), 'src/locales', '{{lng}}', '{{ns}}.json'), // Path to translation files
    },
    detection: {
      order: ['querystring', 'cookie'], // Priority: URL query string first, then cookies
      caches: ['cookie'],               // Cache detected language in cookies
    },
    fallbackLng: 'en',                   // Default language when no language is detected
    preload: ['en', 'ru'],               // Preload these languages at startup
  });

app.use(
  middleware.handle(i18next)
);


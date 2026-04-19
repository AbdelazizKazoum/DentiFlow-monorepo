import {getRequestConfig} from "next-intl/server";

const locales = ["en", "fr", "ar"];
const defaultLocale = "en";

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale =
    requested && locales.includes(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`@shared/messages/${locale}.json`)).default,
  };
});

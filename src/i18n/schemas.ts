import { getLocaleFromRequest } from "@/i18n/get-locale-from-request";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  createMemberLookupSchema,
  createRecoverEmailSchema,
  createRegistrationSchema,
} from "@/lib/validations";

export async function getSchemasForRequest(request: Request) {
  const locale = getLocaleFromRequest(request);
  const dict = await getDictionary(locale);

  return {
    locale,
    dict,
    registrationSchema: createRegistrationSchema(dict.validation),
    recoverEmailSchema: createRecoverEmailSchema(dict.validation),
    memberLookupSchema: createMemberLookupSchema(dict.validation),
  };
}

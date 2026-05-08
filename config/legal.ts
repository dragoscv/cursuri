/**
 * Single source of truth for operator / business identification used across
 * every legal page (Terms, Privacy, GDPR, Refund, Cookies, Legal Notice, DSA)
 * and the cookie banner.
 *
 * Fill in your real details once here. All legal copy is interpolated from
 * these values via next-intl placeholders ({operatorName}, {operatorAddress},
 * etc.) so you never have to edit the JSON message files for an address or
 * fiscal-code change.
 *
 * Romanian context:
 *   - Persoană fizică (private individual) acting as the platform operator.
 *   - For B2B fiscal invoices, customers contact `legalEmail`.
 *   - ANPC and EU ODR (Online Dispute Resolution) links are mandatory under
 *     OUG 34/2014 and Regulation (EU) 524/2013 for distance contracts with
 *     Romanian / EU consumers.
 *
 * To update the visible "last updated" date on every legal page, change
 * `effectiveDate` here.
 */

export interface LegalConfig {
    /** Trading name shown to users (e.g. "StudiAI"). */
    brandName: string;
    /** Public site URL, no trailing slash. */
    siteUrl: string;
    /** Legal name of the operator (full name of the natural person, or PFA / SRL legal name). */
    operatorName: string;
    /** Free-form status label, e.g. "Persoană fizică" / "Private individual" / "PFA" / "SRL". */
    operatorStatus: string;
    /** Postal address (street, number, city, county, postal code, country). */
    operatorAddress: string;
    /** Country (ISO name, used for jurisdiction clauses). */
    operatorCountry: string;
    /** Optional fiscal code (CIF / CUI). Leave empty if not applicable. */
    operatorFiscalCode: string;
    /** Optional Trade Register number (e.g. "F40/.../2025" for PFA, "J40/.../2025" for SRL). */
    operatorRegCom: string;
    /** Optional VAT number — only fill if VAT-registered. */
    operatorVat: string;
    /** General contact email. */
    contactEmail: string;
    /** Support / customer service email (can be the same as contactEmail). */
    supportEmail: string;
    /** Email for legal, billing, B2B invoice requests, GDPR requests, takedown notices. */
    legalEmail: string;
    /** Data Protection contact (can be the same as legalEmail for an individual operator). */
    dpoEmail: string;
    /** Optional phone number. Leave empty to hide. */
    phone: string;

    /** ANPC (Romanian Consumer Protection Authority) public URL. */
    anpcUrl: string;
    /** ANPC SAL (Alternative Dispute Resolution) URL. */
    anpcSalUrl: string;
    /** EU Online Dispute Resolution platform URL. */
    odrUrl: string;
    /** Romanian DPA (ANSPDCP). */
    dataProtectionAuthorityUrl: string;
    /** Romanian DPA name shown in copy. */
    dataProtectionAuthorityName: string;

    /** Date these terms were last updated (YYYY-MM-DD). */
    effectiveDate: string;
}

export const legalConfig: LegalConfig = {
    brandName: 'StudiAI',
    siteUrl: 'https://studiai.ro',
    operatorName: 'Dragos Catalin',
    operatorStatus: 'Persoană fizică',
    operatorAddress: '',
    operatorCountry: 'România',
    operatorFiscalCode: '',
    operatorRegCom: '',
    operatorVat: '',
    contactEmail: 'contact@studiai.ro',
    supportEmail: 'contact@studiai.ro',
    legalEmail: 'contact@studiai.ro',
    dpoEmail: 'contact@studiai.ro',
    phone: '',

    anpcUrl: 'https://anpc.ro',
    anpcSalUrl: 'https://anpc.ro/ce-este-sal/',
    odrUrl: 'https://ec.europa.eu/consumers/odr',
    dataProtectionAuthorityUrl: 'https://www.dataprotection.ro',
    dataProtectionAuthorityName: 'ANSPDCP',

    effectiveDate: '2026-05-08',
};

/**
 * Standard interpolation values to pass to `getTranslations()` / `useTranslations()`
 * when rendering legal copy. Keep the keys in sync with placeholders used in
 * messages/{en,ro}/legal.json.
 */
export function legalInterpolation() {
    return {
        operatorName: legalConfig.operatorName,
        operatorStatus: legalConfig.operatorStatus,
        operatorAddress: legalConfig.operatorAddress,
        operatorCountry: legalConfig.operatorCountry,
        operatorFiscalCode: legalConfig.operatorFiscalCode || '—',
        operatorRegCom: legalConfig.operatorRegCom || '—',
        operatorVat: legalConfig.operatorVat || '—',
        brandName: legalConfig.brandName,
        siteUrl: legalConfig.siteUrl,
        contactEmail: legalConfig.contactEmail,
        supportEmail: legalConfig.supportEmail,
        legalEmail: legalConfig.legalEmail,
        dpoEmail: legalConfig.dpoEmail,
        phone: legalConfig.phone || '—',
        anpcUrl: legalConfig.anpcUrl,
        anpcSalUrl: legalConfig.anpcSalUrl,
        odrUrl: legalConfig.odrUrl,
        dpaName: legalConfig.dataProtectionAuthorityName,
        dpaUrl: legalConfig.dataProtectionAuthorityUrl,
        effectiveDate: legalConfig.effectiveDate,
    } as const;
}

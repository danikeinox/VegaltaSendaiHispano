import type { Dictionary } from "@/i18n/types";

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  id: string;
  title: string;
  sections: LegalSection[];
  cookieTable?: Dictionary["legal"]["cookies"]["items"];
  cookieTableHeaders?: Dictionary["legal"]["cookies"]["tableHeaders"];
};

export function LegalDocument({
  id,
  title,
  sections,
  cookieTable,
  cookieTableHeaders,
}: LegalDocumentProps) {
  return (
    <section id={id} className="scroll-mt-[calc(var(--header-scroll-offset)+1rem)]">
      <h2 className="font-display text-xl font-bold text-portal-primary sm:text-2xl">
        {title}
      </h2>
      <div className="mt-6 space-y-8">
        {sections.map((section) => (
          <div key={section.heading}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-portal-on-surface-variant">
              {section.heading}
            </h3>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-sm leading-relaxed text-portal-on-surface sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        {cookieTable && cookieTableHeaders && (
          <div className="overflow-x-auto rounded-xl border border-portal-outline-variant">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <thead className="bg-portal-surface-container text-xs uppercase tracking-wide text-portal-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {cookieTableHeaders.name}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {cookieTableHeaders.purpose}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {cookieTableHeaders.duration}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {cookieTableHeaders.type}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-portal-outline-variant">
                {cookieTable.map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-mono text-xs text-portal-primary">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-portal-on-surface">
                      {row.purpose}
                    </td>
                    <td className="px-4 py-3 text-portal-on-surface-variant">
                      {row.duration}
                    </td>
                    <td className="px-4 py-3 text-portal-on-surface-variant">
                      {row.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

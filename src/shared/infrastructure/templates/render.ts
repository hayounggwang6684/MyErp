import fs from "node:fs";
import path from "node:path";

const viewRoot = path.resolve(process.cwd(), "src/web/views");

export function renderTemplate(templateName: string, replacements: Record<string, string>) {
  const templatePath = path.join(viewRoot, templateName);
  let contents = fs.readFileSync(templatePath, "utf8");

  for (const [key, value] of Object.entries(replacements)) {
    contents = contents.replaceAll(`{{${key}}}`, value);
  }

  return contents;
}

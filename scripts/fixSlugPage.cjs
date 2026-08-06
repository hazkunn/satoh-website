/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const filePath = "app/inventory/[slug]/page.tsx";
let lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

// Find the line with "product.models.map((model) => ("
const startIdx = lines.findIndex(l => l.includes("product.models.map((model) => ("));
if (startIdx === -1) {
  console.log("ERROR: Could not find start line");
  process.exit(1);
}

// Find the closing "))}" - should be a few lines down
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === "))}") {
    endIdx = i;
    break;
  }
}
if (endIdx === -1) {
  console.log("ERROR: Could not find end line");
  process.exit(1);
}

console.log(`Found section: lines ${startIdx} to ${endIdx}`);
console.log("Start:", lines[startIdx].trim());
console.log("End:", lines[endIdx].trim());

const indentation = lines[startIdx].match(/^\s*/)[0];

const newLines = [
  `${indentation}{product.models.map((model) => {`,
  `${indentation}                      const hasDetailPage = getVBeltModelByCode(model) !== undefined;`,
  `${indentation}                      if (hasDetailPage) {`,
  `${indentation}                        return (`,
  `${indentation}                          <Link`,
  `${indentation}                            key={model}`,
  `${indentation}                            href={\`/inventory/\${slug}/\${model}\`}`,
  `${indentation}                            className="block bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"`,
  `${indentation}                          >`,
  `${indentation}                            {model}`,
  `${indentation}                            <span className="text-blue-600 ml-2 text-xs">\u2192 \u8a73\u7d30</span>`,
  `${indentation}                          </Link>`,
  `${indentation}                        );`,
  `${indentation}                      }`,
  `${indentation}                      return (`,
  `${indentation}                        <div`,
  `${indentation}                          key={model}`,
  `${indentation}                          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700"`,
  `${indentation}                        >`,
  `${indentation}                          {model}`,
  `${indentation}                        </div>`,
  `${indentation}                      );`,
  `${indentation}                    })}`,
];

lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
fs.writeFileSync(filePath, lines.join("\r\n"), "utf8");
console.log("SUCCESS: Model numbers are now clickable links");
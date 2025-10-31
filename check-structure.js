const fs = require("fs");

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  let openDivs = 0;
  let openBraces = 0;

  console.log(`Checking ${filePath}...\n`);

  lines.forEach((line, i) => {
    const lineNumber = i + 1;

    // Count divs
    const divMatches = line.match(/<div/g);
    const closeDivMatches = line.match(/<\/div>/g);

    if (divMatches) openDivs += divMatches.length;
    if (closeDivMatches) openDivs -= closeDivMatches.length;

    // Count braces (excluding comments)
    const braceMatches = line.match(/[^/]{/g);
    const closeBraceMatches = line.match(/[^/]/g);

    if (braceMatches) openBraces += braceMatches.length;
    if (closeBraceMatches) openBraces -= closeBraceMatches.length;

    // Show last 20 lines
    if (lineNumber > lines.length - 20) {
      console.log(
        `${lineNumber}: ${line.trim().substring(0, 80)} | divs: ${openDivs}, braces: ${openBraces}`,
      );
    }
  });

  console.log(`\nFinal counts - Open divs: ${openDivs}, Open braces: ${openBraces}`);

  if (openDivs !== 0 || openBraces !== 0) {
    console.log("❌ STRUCTURE ERROR: Unmatched tags or braces!");
  } else {
    console.log("✅ Structure looks balanced");
  }
}

checkFile("app/membership/ac/components/DocumentUploadSection.js");
checkFile("app/membership/am/components/DocumentUploadSection.js");

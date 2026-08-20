const text = `Café Najjar is a coffee expert with 66 years of experience that evolved over the years to become a leading iconic coffee brand in the region. Today our Lebanese, Espresso and Filtered Coffee are enjoyed by coffee lovers living in Lebanon and all over the world. The company became the biggest coffee factory and the #1 producer of coffee in the Middle East and North Africa region and exports to more than 45 countries globally.
In addition to its iconic brands, Café Najjar offers full coffee solutions to top multinational coffee chains in the Middle East region, Africa, Greece, and Cyprus while ensuring an outstanding coffee experience for their consumers. 
Our aim is to ensure we deliver the perfect cup of coffee everyday everywhere.
Under Najjar Professional Solutions, we provide a high-quality coffee portfolio (Café Najjar, Gia & Ilgustino), Krikita Nuts and Cookers/Byte sweet and savory specialties that could be enjoyed and savored at out of home locations, such as hotels, restaurants, cafes (HoReCa), offices and institutions.
We are looking for a motivated and detail-oriented Junior Software Developer to join our team and support the development, maintenance, and improvement of our existing software systems.
You will be responsible for troubleshooting, debugging, and enhancing software performance, while actively supporting users and improving system functionality based on feedback.`;

// Step 1: Split into lines
const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
console.log('Total lines:', lines.length);
console.log('\n--- First 10 lines ---');
lines.slice(0, 10).forEach((line, i) => {
    console.log(`Line ${i}: "${line.substring(0, 80)}..."`);
});

// Step 2: Find "We are looking for"
const lookingForLine = lines.find(line =>
    line.toLowerCase().includes('we are looking for') ||
    line.toLowerCase().includes('seeking') ||
    line.toLowerCase().includes('hiring')
);
console.log('\n--- Looking for line ---');
console.log(lookingForLine);

// Step 3: Extract job title from that line
if (lookingForLine) {
    const match = lookingForLine.match(/looking for\s+(?:a\s+)?(?:motivated\s+)?(?:talented\s+)?(.+?)(?:\s+to\s+join|$)/i);
    if (match) {
        console.log('\n--- Extracted job title ---');
        console.log(match[1]);
    }
}

// Step 4: Find company name (first line)
console.log('\n--- First line (likely company) ---');
console.log(lines[0]);
const companyMatch = lines[0].match(/^([A-Z][\w\s]+?)\s+is\s+/);
if (companyMatch) {
    console.log('Company extracted:', companyMatch[1]);
}
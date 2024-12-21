const SHEET_ID = '1PlHr1jfajCDJVF-QyFRV8Y4bBIWYj91UjVywZaClUEY';
const WORKSHEET_NAME = 'k-base';

export const fetchSheetData = async () => {
  try {
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${WORKSHEET_NAME}`
    );
    const text = await response.text();
    const jsonString = text.substring(47).slice(0, -2);
    const data = JSON.parse(jsonString);
    return data.table.rows;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return null;
  }
};

export const findMatchingAnswer = (userInput: string, sheetData: any[]) => {
  const words = userInput.toLowerCase().split(' ');
  let bestMatch = { row: null, matchCount: 0 };

  sheetData.forEach((row: any, index: number) => {
    if (index === 0) return; // Skip header row
    
    let matchCount = 0;
    for (let i = 1; i <= 5; i++) { // Columns B to F (indexes 1-5)
      const cellValue = row.c[i]?.v?.toLowerCase() || '';
      if (words.some(word => cellValue.includes(word))) {
        matchCount++;
      }
    }

    if (matchCount > bestMatch.matchCount) {
      bestMatch = {
        row: row,
        matchCount
      };
    }
  });

  if (bestMatch.matchCount >= 1) {
    return {
      answer: bestMatch.row.c[6]?.v, // Column G
      details: bestMatch.row.c[7]?.v // Column H
    };
  }

  return null;
};
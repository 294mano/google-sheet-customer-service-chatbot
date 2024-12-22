const SHEET_ID = '1PlHr1jfajCDJVF-QyFRV8Y4bBIWYj91UjVywZaClUEY';
const WORKSHEET_NAME = 'k-base';
const TRAINING_BOT_WORKSHEET = 'training_bot';

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

export const saveUnansweredQuestion = async (question: string) => {
  try {
    const timestamp = new Date().toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei' 
    });
    
    const formData = new FormData();
    formData.append('sheet_name', TRAINING_BOT_WORKSHEET);
    formData.append('timestamp', timestamp);
    formData.append('question', question);
    
    const response = await fetch(
      `https://script.google.com/macros/s/YOUR_GOOGLE_APPS_SCRIPT_ID/exec`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to save unanswered question');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving unanswered question:', error);
    return false;
  }
};

export const findMatchingAnswer = (userInput: string, sheetData: any[]) => {
  if (!userInput || !sheetData) return null;

  let bestMatch = { row: null, matchCount: 0 };

  sheetData.forEach((row: any) => {
    if (!row.c) return;
    
    let matchCount = 0;
    // 檢查 B 到 F 欄位（索引 1-5）的關鍵字
    for (let i = 1; i <= 5; i++) {
      const cellValue = row.c[i]?.v || '';
      if (cellValue && userInput.includes(cellValue)) {
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

  if (bestMatch.matchCount > 0) {
    return {
      answer: bestMatch.row.c[6]?.v, // Column G
      details: bestMatch.row.c[7]?.v // Column H
    };
  }

  return null;
};

// Function to check and copy completed training data to k-base
export const checkAndCopyTrainingData = async () => {
  try {
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${TRAINING_BOT_WORKSHEET}`
    );
    const text = await response.text();
    const jsonString = text.substring(47).slice(0, -2);
    const data = JSON.parse(jsonString);
    
    const completedRows = data.table.rows.filter((row: any) => 
      row.c[9]?.v === 'done' // Column J has 'done'
    );
    
    if (completedRows.length > 0) {
      const formData = new FormData();
      formData.append('completed_rows', JSON.stringify(completedRows));
      
      await fetch(
        `https://script.google.com/macros/s/YOUR_GOOGLE_APPS_SCRIPT_ID/exec`,
        {
          method: 'POST',
          body: formData
        }
      );
    }
  } catch (error) {
    console.error('Error copying training data:', error);
  }
};
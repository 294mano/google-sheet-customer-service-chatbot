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
    console.log('Attempting to save unanswered question:', question);
    
    const timestamp = new Date().toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei' 
    });
    
    console.log('Generated timestamp:', timestamp);
    
    const formData = new FormData();
    formData.append('sheet_name', TRAINING_BOT_WORKSHEET);
    formData.append('timestamp', timestamp);
    formData.append('question', question);
    
    console.log('Sending request to Google Apps Script...');
    
    // 更新為新的 Google Apps Script URL
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbwV8sweQD8v-PA/exec',
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      }
    );
    
    console.log('Response received:', response);
    console.log('Successfully sent unanswered question');
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
      answer: bestMatch.row.c[6]?.v,
      details: bestMatch.row.c[7]?.v
    };
  }

  return null;
};

export const checkAndCopyTrainingData = async () => {
  try {
    console.log('Checking for completed training data...');
    
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${TRAINING_BOT_WORKSHEET}`
    );
    const text = await response.text();
    const jsonString = text.substring(47).slice(0, -2);
    const data = JSON.parse(jsonString);
    
    const completedRows = data.table.rows.filter((row: any) => 
      row.c[9]?.v === 'done'
    );
    
    console.log('Found completed rows:', completedRows.length);
    
    if (completedRows.length > 0) {
      const formData = new FormData();
      formData.append('completed_rows', JSON.stringify(completedRows));
      
      await fetch(
        'https://script.google.com/macros/s/AKfycbwV8sweQD8v-PA/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData
        }
      );
      
      console.log('Successfully sent completed training data');
    }
  } catch (error) {
    console.error('Error copying training data:', error);
  }
};
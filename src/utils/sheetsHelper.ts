const SHEET_ID = '1PlHr1jfajCDJVF-QyFRV8Y4bBIWYj91UjVywZaClUEY';
const WORKSHEET_NAME = 'k-base';
const TRAINING_BOT_WORKSHEET = 'training_bot';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuiDMpTDbBWRISWb-e37yoVOj7hEaaLcgTvBaL-Qt7Yrqiy3xVx22jJ4fdwFHbdmL9/exec';

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
    
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
    
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
    
    // 找出 J 欄（index 9）標記為 'done' 的列
    const completedRows = data.table.rows.filter((row: any) => 
      row.c && row.c[9] && row.c[9].v.trim().toLowerCase() === 'done'
    );
    
    console.log('Found completed rows:', completedRows.length);
    
    if (completedRows.length > 0) {
      const formData = new FormData();
      
      // 將完整的列資料（B到J欄）轉換成純值陣列
      const rowsToSend = completedRows.map((row: any) => {
        // 取得 B 到 J 欄的資料（index 1-9），並確保每個儲存格都有值
        const cells = row.c.slice(1, 10).map((cell: any) => {
          return cell ? cell.v : ''; // 如果儲存格存在就取值，否則返回空字串
        });
        return cells;
      });
      
      console.log('Prepared rows to send:', JSON.stringify(rowsToSend, null, 2));
      
      formData.append('completed_rows', JSON.stringify(rowsToSend));
      formData.append('action', 'copy_to_kbase');
      formData.append('sheet_name', 'k-base'); // 明確指定目標工作表
      
      console.log('Sending data to Apps Script...');
      
      const copyResponse = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      
      console.log('Successfully sent completed training data');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error copying training data:', error);
    return false;
  }
};
const fs = require('fs');
const csvParser = require('csv-parser');
const readline = require('readline');

const inputFilePath = 'input.csv';
const outputFilePath = 'output.csv';

const checkFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileSize = fs.statSync(filePath).size;

  if (fileSize === 0) {
    throw new Error(`File is empty: ${filePath}`);
  }  
};

const readCSV = () => {
  const results = [];

  return new Promise((resolve, reject) => {
    try {
      checkFile(inputFilePath);

      fs.createReadStream(inputFilePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          if (results.length === 0) {
            reject(`CSV file is empty: ${inputFilePath}`);
            return;
          }

          const expectedHeader = ['Name', 'Age', 'City', 'Email'];
          const csvHeader = Object.keys(results[0]);

          if(!expectedHeader.every((header) => csvHeader.includes(header))) {
            reject(`CSV file has invalid header: ${inputFilePath}`);
            return;
          }

          resolve(results);
        })
        .on('error', (error) => reject(error));
    } catch (error) {
      reject(error.message);
    }
  })
};

const filterOlderAgeData = (data) => {
  const filteredData = data.filter((obj) => +obj.Age < 30);
  return filteredData;
};

const addIsAdultProperty = (data) => {
  const mappedData = data.map((obj) => {
    obj.IsAdult = +obj.Age >= 18;
    return obj;
  });
  return mappedData;
};

const writeOutputCSV = (data) => {
  const header = ['Name', 'Age', 'City', 'Email', 'IsAdult'];
  const csvData = data.map((obj) => [obj.Name, obj.Age, obj.City, obj.Email, obj.IsAdult]);

  csvData.unshift(header);

  const csv = csvData.join('\n');

  const writeOutputCSV = () => {
    fs.writeFile(outputFilePath, csv, (error) => {
      if (error) throw error;
      console.log('CSV file has been saved!');
    });
  }

  if (!fs.existsSync(outputFilePath)) {
    writeOutputCSV();
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`The file "${outputFilePath}" already exists. Do you want to overwrite it? (y/n) `, (answer) => {
    if (answer.toLowerCase() === 'y') {
      writeOutputCSV();
      rl.close();
      return;
    }

    console.log('Operation cancelled.');
    rl.close();
  });
};

readCSV()
  .then(filterOlderAgeData)
  .then(addIsAdultProperty)
  .then(writeOutputCSV)
  .catch((error) => console.error(error));
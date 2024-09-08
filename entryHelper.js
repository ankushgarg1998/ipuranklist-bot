import fs from 'fs';
import { JSDOM } from 'jsdom';
import { log } from './util/logger.js';
import Constants from "./Constants.js";

// -----------------------------------------------------------------------------------------------
// === HELPER FUNCTIONS ===
// Function to extract 10 result lines from the result HTML Page.
const getRowsFromTable = (entryType, tableElement, numberOfEntries) => {
    if (Constants.ENTRY_TYPE_RESULT === entryType) {
        return [...tableElement.firstElementChild.children].slice(1, numberOfEntries);
    } else if (Constants.ENTRY_TYPE_DATESHEET === entryType) {
        return [...tableElement.lastElementChild.children].slice(0, numberOfEntries);
    } else
        return [];
}

const extractEntriesFromPage = (entryType, htmlPage) => {
    const numberOfEntries = 10;
    let html = new JSDOM(htmlPage);
    let tableElement = html.window.document.querySelector("table");
    let rows = getRowsFromTable(entryType, tableElement, numberOfEntries);
    let message = `📅 *RECENT ${numberOfEntries} ${entryType.toUpperCase()}S :*\n\n`;
    rows.forEach(row => {
        let dateElementMessage = "---";
        if (row.children.length !== 1) {
            dateElementMessage = getPossiblySpanWrappedElement(row.lastElementChild);
        }
        message += `*${dateElementMessage}:*\n`;
        let titleElementMessage = getPossiblySpanWrappedElement(row.firstElementChild);
        message += `${sanitizePdfTitle(titleElementMessage)}\n\n`;
    });
    return message;
};

// Get possibly span wrapped element
function getPossiblySpanWrappedElement(element) {
    let elementString = element.innerHTML.trim();
    return elementString.replace(/<\/?[^>]+(>|$)/g, '');
}

// Sanitize PDF Title
function sanitizePdfTitle(title) {
    return title
        .replace('\n\t', '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace('_', '-').trim();
}

// Writes the content of dataObj to the data.json file.
const writeDataFile = (dataObj) => {
    try {
        fs.writeFileSync(Constants.DATA_FILE_PATH, JSON.stringify(dataObj, null, 4), 'utf8');
        log('=> Data written to file successfully.');
    } catch (err) {
        log('=> Error in writing data to file:');
        log(err);
    }
};

export default {
    extractEntriesFromPage,
    writeDataFile
};

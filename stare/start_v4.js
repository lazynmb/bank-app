const express = require('express');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const port = 3000;
const folderPath = 'D:/Desktop/programowanie/bank app/Doks';

function findLatestHtmlFile(dirPath) {
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.html'));
    const sortedByDate = files.map(filename => ({
        name: filename,
        time: fs.statSync(path.join(dirPath, filename)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);

    return sortedByDate.length ? sortedByDate[0].name : null;
}

function calcFromPairs(positivePairs) {
    let totalNet = 0;
    let totalVAT = 0;
    let totalBrutto = 0;

    positivePairs.forEach(pairs => {
        const brutto = Object.values(pairs)[0];
        const net = brutto / 1.23;
        const vat = brutto - net;
        totalNet += net;
        totalVAT += vat;
        totalBrutto += brutto;
    });

    return {
        totalNet: totalNet.toFixed(2),
        totalVAT: totalVAT.toFixed(2),
        totalBrutto: totalBrutto.toFixed(2),
        positivePairs
    };
}

function calcFromNegativePairs(negativePairs, totalVATFromPositivePairs) {
    let totalVATNegative = 0;
    let totalBruttoNegative = 0;

    negativePairs.forEach(pair => {
        const bruttoNegative = Object.values(pair)[0];
        const netNegative = bruttoNegative / 1.23;
        const vatNegative = bruttoNegative - netNegative;
        totalVATNegative += vatNegative;
        totalBruttoNegative += bruttoNegative;
    });

    const totalVATNettoNegative = parseFloat(totalVATFromPositivePairs) + totalVATNegative;

    return {
        totalVATNegative: totalVATNegative.toFixed(2),
        totalBruttoNegative: totalBruttoNegative.toFixed(2),
        totalVATNettoNegative: totalVATNettoNegative.toFixed(2)
    };
}

function parseHtmlAndExtractData(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(data);
    let pairs = [];
    let negPairs = [];

    $('table').eq(4).find('tr').slice(1).each(function() {
        const col2 = $(this).find('td').eq(1).text().trim();
        let col5 = $(this).find('td').eq(4).text().trim().replace('PLN', '').trim();
        col5 = col5.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
        const col5AsFloat = parseFloat(col5);

        if (!isNaN(col5AsFloat)) {
            if (col5AsFloat

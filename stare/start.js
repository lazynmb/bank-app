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

app.get('/parse-latest-html', (req, res) => {
    const latestHtmlFile = findLatestHtmlFile(folderPath);
    if (!latestHtmlFile) {
        return res.status(404).send('No HTML files found.');
    }

    const fullPath = path.join(folderPath, latestHtmlFile);
    fs.readFile(fullPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading the HTML file.');
        }
        
        const $ = cheerio.load(data); // Załadowanie odczytanego HTML-a do cheerio
        let pairs = []; // Inicjalizacja tablicy na pary
    
        // Znajdowanie drugiej tabeli, pomijanie nagłówka i iteracja po wierszach
        $('table').eq(4).find('tr').slice(1).each(function() {
            const col2 = $(this).find('td').eq(1).text().trim(); // Pobranie treści z drugiej kolumny
            let col5 = $(this).find('td').eq(4).text().trim().replace('PLN', '').trim();
            col5 = col5.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.]/g, '');
            const col5AsFloat = parseFloat(col5); // Konwersja na liczbę zmiennoprzecinkową

            if (!isNaN(col5AsFloat)) { // Sprawdzenie, czy konwersja na liczbę była pomyślna
                pairs.push({[col2]: col5AsFloat});
            }
        });

        // Filtracja par, aby usunąć te z ujemną wartością
        const filteredPairs = pairs.filter(function(pair) {
            const value = Object.values(pair)[0];
            return value >= 0;
        });

    
        const formattedString = filteredPairs.map(pair => JSON.stringify(pair)).join('<br>');
        res.send(formattedString);



    });
    

    
});

app.get('/parse-latest-html', (req, res) => {
    function calculateNetAndVATFromPairs(pairs) {
        let totalNet = 0;
        let totalVAT = 0;
        const individualCalculations = pairs.map(pair => {
            const value = Object.values(pair)[0]; // Zakładając, że wartość brutto jest drugim elementem w parze
            const net = value / 1.23;
            const vat = value - net;
            totalNet += net;
            totalVAT += vat;
            return {
                ...pair,
                net: net.toFixed(2),
                vat: vat.toFixed(2)
            };
        });

        return {
            totalNet: totalNet.toFixed(2),
            totalVAT: totalVAT.toFixed(2),
            individualCalculations
        };
        res.send(totalVAT);
    }
});


    app.listen(port, () => {
        console.log(`Serwer działa na porcie ${port}`);
    });
    

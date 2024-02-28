const express = require('express');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vzirtldrmuzpurjjcsrf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aXJ0bGRybXV6cHVyampjc3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTcyODUwNywiZXhwIjoyMDExMzA0NTA3fQ.sQmREUFOAqP5tclU1Uc3pGJtjYl3i7uQmgB82TSIXLI'
const supabase = createClient(supabaseUrl, supabaseKey)


const app = express();
const port = 80;
const folderPath = path.join(__dirname, 'Doks');

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

    return xyz = {
        totalNet: totalNet.toFixed(2),
        totalVAT: totalVAT.toFixed(2),
        totalBrutto: totalBrutto.toFixed(2),
        positivePairs 
    };
}

function calcFromNegativePairs(negativePairs, positivePairs) {
    let totalVATNegative = 0;
    let totalBruttoNegative = 0;

    negativePairs.forEach(pair => {
        const bruttoNegative = Object.values(pair)[0];
        const netNegative = bruttoNegative / 1.23;
        const vatNegative = bruttoNegative - netNegative;
        totalVATNegative += vatNegative;
        totalBruttoNegative += bruttoNegative;
    });

    // Przekształcenie stringa na liczbę, aby wykonać operacje matematyczną
    var totalVATPositiveAccess = calcFromPairs(positivePairs); 
    var totalVATPositive = totalVATPositiveAccess.totalVAT;
    let totalVATNettoNegative = parseFloat(totalVATPositive) + totalVATNegative;

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
            if (col5AsFloat >= 0) {
                pairs.push({[col2]: col5AsFloat}); // Dodajemy do listy wartości dodatnich
            } else {
                negPairs.push({[col2]: col5AsFloat}); // Dodajemy do listy wartości ujemnych
            }
        }
    });

    // Teraz zwracamy obie listy
    return { positivePairs: pairs, negativePairs: negPairs };
}

function categories(filePath){
    const data = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(data);

    let bramka = [];
    let zaplaconyVat = [];
    let dochodowy =[];
    let subskrypcje =[];
    let czynsze = [];
    let uslugi = [];
    let wyplaty = [];
    

    $('table').eq(4).find('tr').slice(1).each(function() {
        const col2 = $(this).find('td').eq(1).text().trim();
        let col5 = $(this).find('td').eq(4).text().trim().replace('PLN', '').trim();
        col5 = col5.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
        const col5AsFloat = parseFloat(col5);
        const bramkaStrings = ['MELEMENTS'];
        const dochodowyStrings = ['URZĄD SKARBOWY'];
        const subskrypcjeStrings = ['AUTO-TUNE', 'YOUTUBE', 'THE MASTERS', 'SLATE', 'PLUGIN', 'DROPBOX', 'ADOBE', 'SPLICE', 'BENEFIT', 'UNIVERSAL AUDIO', 'PLAYSTATION', 'WAVES', 'HEROKU', 'VERCEL', 'MIRO', 'CHATGPT', 'SUPABASE', 'PADDLE.NET'];
        const czynszeStrings = ['LUKASIEWICZ', 'WOJSKOWA'];
        const uslugiStrings = ['P4 SP.', 'ABCGO', 'PIASTPOL', 'JUWENTUS', 'ORANGE'];
        const wyplatyStrings = ['ŁOŚ JONATAN', 'IWAN DOMINIK', 'CYBULSKI SZYMON', 'LITKOWIEC BRAJAN', 'PALARCZYK DOMINIK', 'DREWNIAK KORNELIUSZ', 'PAJDZIK WIKTOR', 'KRZEMIŃSKI SEBASTIAN', 'MICKIEWICZ PAWEŁ', 'ROZWADOWSKI JAKUB', 'MADEJ SANDRA', 'WRÓBLEWSKI ŁUKASZ', 'OSTROWSKI HUBERT', 'NOWICKI KAROL', 'KOWALCZYK MACIEJ', 'KAKIETEK MARIUSZ'];

        if (bramkaStrings.some(str => col2.includes(str)) && col5AsFloat >= 0) {
            bramka.push(col5AsFloat);
        } else if (dochodowyStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            dochodowy.push(col5AsFloat);
        } else if (subskrypcjeStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            subskrypcje.push(col5AsFloat);
        } else if (czynszeStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            czynsze.push(col5AsFloat);
        } else if (uslugiStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            uslugi.push(col5AsFloat);
        } else if (wyplatyStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            wyplaty.push(col5AsFloat);
        }






        // if(col2.includes('MELEMENTS') && col5AsFloat >= 0){
        //     bramka.push(Math.abs(col5AsFloat))
        // } else if(col2.includes('URZĄD SKARBOWY') && col5AsFloat <= 0){
        //     dochodowy.push(col5AsFloat)
        // } else if(col2.includes('AUTO-TUNE' || 'YOUTUBE' || 'THE MASTERS' || 'SLATE' || 'PLUGIN' || 'DROPBOX' || 'ADOBE' || 'SPLICE' || 'BENEFIT' || 'UNIVERSAL AUDIO' || 'PLAYSTATION' || ' WAVES' || 'HEROKU' || 'VERCEL' || 'MIRO' || 'CHATGPT' || ' SUPABASE' || 'PADDLE.NET') && col5AsFloat <= 0){
        //     subskrypcje.push(col5AsFloat)
        // } else if(col2.includes('LUKASIEWICZ' || 'WOJSKOWA') && col5AsFloat <= 0){
        //     czynsze.push(col5AsFloat)
        // } else if(col2.includes('P4 SP.' || 'ABCGO' || 'PIASTPOL' || 'JUWENTUS' || 'ORANGE') && col5AsFloat <= 0){
        //     uslugi.push(col5AsFloat)
        // } else if(col2.includes('ŁOŚ JONATAN' || 'IWAN DOMINIK' || 'CYBULSKI SZYMON' || 'LITKOWIEC BRAJAN' || 'PALARCZYK DOMINIK' || 'DREWNIAK KORNELIUSZ' || 'PAJDZIK WIKTOR' || 'KRZEMIŃSKI SEBASTIAN' || 'MICKIEWICZ PAWEŁ' || 'ROZWADOWSKI JAKUB' || 'MADEJ SANDRA' || 'WRÓBLEWSKI ŁUKASZ' || 'OSTROWSKI HUBERT' || 'NOWICKI KAROL' || 'KOWALCZYK MACIEJ' || 'KAKIETEK MARIUSZ') && col5AsFloat <= 0){
        //     wyplaty.push(col5AsFloat)
        // }

})

    let allExp = [bramka, zaplaconyVat, dochodowy, subskrypcje, czynsze, uslugi, wyplaty]    
    return allExp;
}

function sumator(allExp){
    let sums = {};
    let categoriesNames = ['bramka', 'zaplaconyVat', 'dochodowy', 'subskrypcje', 'czynsze', 'uslugi', 'wyplaty'];

    allExp.forEach((exp, index) => {
        let sum = exp.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        sums[categoriesNames[index]] = sum.toFixed(2); // Formatowanie do dwóch miejsc po przecinku
    });

    console.log(sums);
    return sums; // Zwrócenie obiektu sums
}

async function sumSalaries() {
    let { data, error } = await supabase
        .from('salaries')
        .select('amount');

    if (error) {
        console.error('Error fetching salaries:', error);
        return 0; // Zwróć 0 w przypadku błędu, aby obsłużyć to w logice aplikacji.
    }

    // Sumowanie wartości z kolumny 'amount' po usunięciu dwóch ostatnich zer i logowanie każdej wartości
    const total = data.reduce((acc, row) => {
        // Usunięcie dwóch ostatnich zer poprzez dzielenie przez 100
        const adjustedAmount = row.amount / 100;
        console.log('Pobrana wartość po korekcie:', adjustedAmount); // Logowanie skorygowanej wartości
        return acc + adjustedAmount;
    }, 0);

    return total; // Bezpośrednio zwraca sumę.
}

  app.get('/parse-latest-html', async (req, res) => { // Zmieniono na async
    const latestHtmlFile = findLatestHtmlFile(folderPath);
    if (!latestHtmlFile) {
        return res.status(404).send('No HTML files found.');
    }

    const fullPath = path.join(folderPath, latestHtmlFile);
    const { positivePairs, negativePairs } = parseHtmlAndExtractData(fullPath);
    const positiveCalculationsResult = calcFromPairs(positivePairs);
    const negativeCalculationsResult = calcFromNegativePairs(negativePairs, positivePairs);
    const allExp = categories(fullPath);
    const sums = sumator(allExp);
    const salariesTotal = await sumSalaries(); // Używamy await, aby poczekać na wynik.

    const resultString = 
        `Suma brutto (pozytywne): ${positiveCalculationsResult.totalBrutto}<br>` +
        `Suma netto (pozytywne): ${positiveCalculationsResult.totalNet}<br>` +
        `Suma VAT (pozytywne): ${positiveCalculationsResult.totalVAT}<br><br>` +
        `Suma VAT (negatywne): ${negativeCalculationsResult.totalVATNegative}<br>` +
        `Suma brutto (negatywne): ${negativeCalculationsResult.totalBruttoNegative}<br>` +
        `VAT netto (negatywne): ${negativeCalculationsResult.totalVATNettoNegative}<br><br>` +
        `Suma wynagrodzeń: ${salariesTotal}<br><br>`; // Dodano linię z sumą wynagrodzeń

    res.send(resultString);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

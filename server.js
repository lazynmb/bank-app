// server.js
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vzirtldrmuzpurjjcsrf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aXJ0bGRybXV6cHVyampjc3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTcyODUwNywiZXhwIjoyMDExMzA0NTA3fQ.sQmREUFOAqP5tclU1Uc3pGJtjYl3i7uQmgB82TSIXLI'
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = 80;
const folderPath = path.join(__dirname, 'Doks');

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.use(express.static('public')); // Ustawienie katalogu publicznego

app.get('/api/data', async (req, res) => {
  // Tutaj umieść logikę dotyczącą przetwarzania danych, np. sumSalaries()
  const salariesTotal = await sumSalaries(); // Przykład wywołania funkcji asynchronicznej
  res.json({ salariesTotal });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
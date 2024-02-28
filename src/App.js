import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {data ? <p>Suma wynagrodzeń: {data.salariesTotal}</p> : 'Ładowanie...'}
      </header>
    </div>
  );
}

export default App;
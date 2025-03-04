import './App.css';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  const [item, setItem] = useState('');
  const [brand, setBrand] = useState('');
  const [available, setAvailable] = useState('');
  interface TableData {
    item: string;
    brand: string;
    available: number;
  }

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [updateMode, setUpdateMode] = useState('add'); // State to track the selected mode

  // Load data from local storage when the component mounts
  useEffect(() => {
    const storedData = localStorage.getItem('tableData');
    if (storedData) {
      setTableData(JSON.parse(storedData));
    }
  }, []);

  // Save data to local storage whenever tableData changes
  useEffect(() => {
    localStorage.setItem('tableData', JSON.stringify(tableData));
  }, [tableData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newData = { item, brand, available: parseInt(available) };

    // Check if the item with the same name and brand already exists
    const existingItemIndex = tableData.findIndex(
      (data) => data.item === item && data.brand === brand
    );

    if (existingItemIndex !== -1) {
      // If the item exists, update the available count based on the selected mode
      const updatedTableData = [...tableData];
      if (updateMode === 'add') {
        updatedTableData[existingItemIndex].available += newData.available;
      } else if (updateMode === 'update') {
        updatedTableData[existingItemIndex].available = newData.available;
      }
      setTableData(updatedTableData);
    } else {
      // If the item does not exist, add it to the table
      setTableData([...tableData, newData]);
    }

    setItem('');
    setBrand('');
    setAvailable('');
  };

  const handleClearData = () => {
    localStorage.removeItem('tableData');
    setTableData([]);
  };

  const handleExportPDF = (): void => {
    try {
      const doc = new jsPDF('landscape');
      doc.text('Grocery List', 14, 16);
      autoTable(doc, {
        head: [['Item', 'Brand', 'Available', 'Used', 'Bought']],
        body: tableData.map((data) => [data.item, data.brand, data.available.toString(), '', '']),
        startY: 20,
      });
      doc.save('grocery-list.pdf');
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Sort tableData alphabetically by item name, then by brand if item names are the same
  const sortedTableData = [...tableData].sort((a, b) => {
    if (a.item.localeCompare(b.item) === 0) {
      return a.brand.localeCompare(b.brand);
    }
    return a.item.localeCompare(b.item);
  });

  return (
    <div className="App">
      <form onSubmit={handleSubmit} className="justify-content-center d-flex flex-wrap">
        <div className="form-group mr-2">
          <label htmlFor="item">Item</label>
          <input
            type="text"
            className="form-control"
            id="item"
            placeholder="Item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>
        <div className="form-group mr-2">
          <label htmlFor="brand">Brand</label>
          <input
            type="text"
            className="form-control"
            id="brand"
            placeholder="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div className="form-group mr-2">
          <label htmlFor="available">Available</label>
          <input
            type="number"
            className="form-control"
            id="available"
            placeholder="Available"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
          />
        </div>
        <div className="form-group mr-2">
          <label>Mode</label>
          <div>
            <input
              type="radio"
              id="add"
              name="mode"
              value="add"
              checked={updateMode === 'add'}
              onChange={(e) => setUpdateMode(e.target.value)}
            />
            <label htmlFor="add">Add</label>
          </div>
          <div>
            <input
              type="radio"
              id="update"
              name="mode"
              value="update"
              checked={updateMode === 'update'}
              onChange={(e) => setUpdateMode(e.target.value)}
            />
            <label htmlFor="update">Update</label>
          </div>
        </div>
        <button type="submit" className="btn btn-primary custom-btn">Submit</button>
      </form>
      
      <table className="table table-striped table-bordered table-hover mt-3">
        <thead>
          <tr>
            <th className="text-center">Item</th>
            <th className="text-center">Brand</th>
            <th className="text-center" style={{ width: '5%' }}>Available</th>
            <th className="text-center" style={{ width: '25%' }}>Used</th>
            <th className="text-center" style={{ width: '25%' }}>Bought</th>
          </tr>
        </thead>
        <tbody>
          {sortedTableData.map((data, index) => (
            <tr key={index}>
              <td className="text-center">{data.item}</td>
              <td className="text-center">{data.brand}</td>
              <td className="text-center" style={{ width: '5%' }}>{data.available}</td>
              <td className="text-center" style={{ width: '25%' }}></td>
              <td className="text-center" style={{ width: '25%' }}></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleClearData} className="btn btn-danger mt-3">Clear Data</button>
      <button onClick={handleExportPDF} className="btn btn-secondary mt-3 ml-2">Export to PDF</button>
    </div>
  );
}

export default App;
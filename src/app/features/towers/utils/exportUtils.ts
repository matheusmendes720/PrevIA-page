/**
 * Export Utilities
 * Functions to export tower data in various formats
 */

import { Tower } from './mockTowerData';

export function exportToCSV(towers: Tower[], filename: string = 'towers-export.csv') {
  if (towers.length === 0) {
    alert('No towers to export');
    return;
  }

  const headers = [
    'ID',
    'Latitude',
    'Longitude',
    'Zone',
    'Zone Type',
    'Region',
    'State',
    'State Name',
    'Status',
    'Priority',
    'Height (m)',
    'Last Maintenance',
    'Next Maintenance',
    'Operator Count',
    'Signal Strength (%)',
    'Uptime (%)',
  ];

  const rows = towers.map(tower => [
    tower.id,
    tower.lat.toString(),
    tower.lng.toString(),
    tower.zone,
    tower.zoneType,
    tower.region,
    tower.state,
    tower.stateName,
    tower.status,
    tower.priority,
    tower.height.toString(),
    tower.lastMaintenance,
    tower.nextMaintenance,
    tower.operatorCount.toString(),
    tower.signalStrength.toString(),
    tower.uptime.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(towers: Tower[], filename: string = 'towers-export.json') {
  if (towers.length === 0) {
    alert('No towers to export');
    return;
  }

  const jsonContent = JSON.stringify(towers, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(towers: Tower[], filename: string = 'towers-export.pdf') {
  // Simple PDF export using browser print
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Towers Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #06b6d4; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #06b6d4; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          @media print { @page { size: landscape; } }
        </style>
      </head>
      <body>
        <h1>Nova Corrente - Towers Export</h1>
        <p>Generated: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Total Towers: ${towers.length}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Region</th>
              <th>State</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Height (m)</th>
              <th>Signal (%)</th>
              <th>Uptime (%)</th>
            </tr>
          </thead>
          <tbody>
            ${towers.slice(0, 100).map(tower => `
              <tr>
                <td>${tower.id}</td>
                <td>${tower.region}</td>
                <td>${tower.stateName || tower.state}</td>
                <td>${tower.status}</td>
                <td>${tower.priority}</td>
                <td>${tower.height}</td>
                <td>${tower.signalStrength}</td>
                <td>${tower.uptime}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${towers.length > 100 ? `<p><em>Showing first 100 of ${towers.length} towers. Use CSV/JSON export for full data.</em></p>` : ''}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}


/**
 * Data Export Utilities
 * Supports CSV, Excel, and JSON export
 */

export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToJSON = (data, filename = 'export.json') => {
    if (!data) {
        alert('No data to export');
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToExcel = (data, filename = 'export.xlsx') => {
    // For Excel export, we'll use CSV format with .xlsx extension
    // In production, you'd use a library like xlsx or exceljs
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
};

export const copyToClipboard = async (data) => {
    try {
        const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

export const printData = (data, title = 'Data Export') => {
    const printWindow = window.open('', '', 'height=600,width=800');

    printWindow.document.write('<html><head><title>' + title + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
    printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
    printWindow.document.write('th { background-color: #10B981; color: white; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>' + title + '</h1>');

    if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        printWindow.document.write('<table>');
        printWindow.document.write('<thead><tr>');
        headers.forEach(header => {
            printWindow.document.write('<th>' + header + '</th>');
        });
        printWindow.document.write('</tr></thead><tbody>');

        data.forEach(row => {
            printWindow.document.write('<tr>');
            headers.forEach(header => {
                printWindow.document.write('<td>' + (row[header] || '') + '</td>');
            });
            printWindow.document.write('</tr>');
        });

        printWindow.document.write('</tbody></table>');
    } else {
        printWindow.document.write('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
    }

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
};

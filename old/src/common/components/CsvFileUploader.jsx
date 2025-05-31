import React, { useRef, useState } from 'react';
import Papa from 'papaparse';

/**
 * Sample CSV structure:
 * program,platform,visibility,status,apex_domain
 * Acme Corp,HackerOne,public,active,acme.com
 * Acme Corp,HackerOne,public,active,acme.net
 * Beta Inc,Bugcrowd,private,active,beta.com
 *
 * Generic CSV file uploader component.
 * Props:
 *   - onCsvParsed: (data: object[] | null, error: string | null) => void
 *   - accept: string (default: '.csv,text/csv')
 *   - label: string (button label)
 *   - maxSize: number (bytes, optional)
 */
const CsvFileUploader = ({
  onCsvParsed,
  accept = '.csv,text/csv',
  label = 'Upload CSV',
  maxSize = 2 * 1024 * 1024, // 2MB default
}) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    // Validate type
    if (!file.type.match(/csv/i) && !file.name.match(/\.csv$/i)) {
      setError('Only CSV files are allowed.');
      onCsvParsed(null, 'Only CSV files are allowed.');
      return;
    }
    // Validate size
    if (maxSize && file.size > maxSize) {
      setError(`File is too large (max ${Math.round(maxSize/1024/1024)}MB).`);
      onCsvParsed(null, `File is too large (max ${Math.round(maxSize/1024/1024)}MB).`);
      return;
    }
    // Parse CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setError('CSV parse error: ' + results.errors[0].message);
          onCsvParsed(null, 'CSV parse error: ' + results.errors[0].message);
          return;
        }
        // Validate columns
        const required = ['program', 'platform', 'visibility', 'status', 'apex_domain'];
        const missing = required.filter(col => !results.meta.fields.includes(col));
        if (missing.length > 0) {
          setError('Missing required columns: ' + missing.join(', '));
          onCsvParsed(null, 'Missing required columns: ' + missing.join(', '));
          return;
        }
        // Validate all values are strings
        const data = results.data.map(row => {
          const obj = {};
          required.forEach(col => {
            obj[col] = (row[col] || '').toString().trim();
          });
          return obj;
        });
        onCsvParsed(data, null);
      },
      error: (err) => {
        setError('CSV parse error: ' + err.message);
        onCsvParsed(null, 'CSV parse error: ' + err.message);
      },
    });
  };

  return (
    <div className="csv-uploader">
      <div className="csv-upload-label">{label}</div>
      <div className="csv-upload-input-row">
        <input
          id="csv-upload-input"
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          aria-label="Upload CSV file"
          tabIndex={0}
        />
        {fileName && <span className="csv-upload-filename">{fileName}</span>}
      </div>
      {error && <div className="csv-upload-error" role="alert">{error}</div>}
    </div>
  );
};

export default CsvFileUploader; 
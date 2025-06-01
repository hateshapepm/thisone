import React, { useState } from 'react';

const mockData = {
  program: [
    { id: '1', username: 'alice', password: 'pass123', source: 'Recon', status: 'new', dateAdded: '2024-06-01', notes: 'Found in dump' },
    { id: '2', username: 'bob', password: 'hunter2', source: 'Pastebin', status: 'new', dateAdded: '2024-06-02' },
  ],
  working: [
    { id: '3', username: 'charlie', password: 'letmein', source: 'Recon', status: 'working', dateAdded: '2024-06-03' },
  ],
  submitted: [
    { id: '4', username: 'dave', password: 'qwerty', source: 'Recon', status: 'submitted', dateAdded: '2024-06-04', notes: 'Submitted to program X' },
  ],
};

const typeLabels = {
  program: 'Program Credentials',
  working: 'Working Credentials',
  submitted: 'Submitted Credentials',
};

const CredentialsTable = ({ type }) => {
  const [filter, setFilter] = useState('');
  const data = mockData[type].filter(
    cred =>
      cred.username.toLowerCase().includes(filter.toLowerCase()) ||
      cred.source.toLowerCase().includes(filter.toLowerCase())
  );

  const handleFilterChange = (e) => setFilter(e.target.value);
  const handleView = (cred) => {/* Implement view logic */};
  const handleEdit = (cred) => {/* Implement edit logic */};
  const handleSubmit = (cred) => {/* Implement submit logic */};
  const handleDelete = (cred) => {/* Implement delete logic */};

  if (data.length === 0) {
    return (
      <div className="table-wrapper">
        <h2>{typeLabels[type]}</h2>
        <input
          type="text"
          className="filter-input"
          placeholder="Filter by username or source..."
          value={filter}
          onChange={handleFilterChange}
          aria-label="Filter credentials by username or source"
        />
        <div className="no-data">No credentials found.</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <h2>{typeLabels[type]}</h2>
      <input
        type="text"
        className="filter-input"
        placeholder="Filter by username or source..."
        value={filter}
        onChange={handleFilterChange}
        aria-label="Filter credentials by username or source"
      />
      <div className="table-responsive">
        <table className="data-table" role="table">
          <thead>
            <tr>
              <th scope="col">Username</th>
              <th scope="col">Password</th>
              <th scope="col">Source</th>
              <th scope="col">Status</th>
              <th scope="col">Date Added</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(cred => (
              <tr key={cred.id}>
                <td>{cred.username}</td>
                <td>{cred.password}</td>
                <td>{cred.source}</td>
                <td>{cred.status}</td>
                <td>{cred.dateAdded}</td>
                <td className="actions-cell">
                  <button
                    className="btn view-btn"
                    aria-label={`View credential for ${cred.username}`}
                    tabIndex={0}
                    onClick={() => handleView(cred)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleView(cred); }}
                  >View</button>
                  <button
                    className="btn edit-btn"
                    aria-label={`Edit credential for ${cred.username}`}
                    tabIndex={0}
                    onClick={() => handleEdit(cred)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleEdit(cred); }}
                  >Edit</button>
                  {type !== 'submitted' && (
                    <button
                      className="btn activate-btn"
                      aria-label={`Submit credential for ${cred.username}`}
                      tabIndex={0}
                      onClick={() => handleSubmit(cred)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSubmit(cred); }}
                    >Submit</button>
                  )}
                  <button
                    className="btn delete-btn"
                    aria-label={`Delete credential for ${cred.username}`}
                    tabIndex={0}
                    onClick={() => handleDelete(cred)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleDelete(cred); }}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CredentialsTable; 
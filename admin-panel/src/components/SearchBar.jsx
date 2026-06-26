import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ value: externalValue, onChange, placeholder = 'Search...', debounceMs = 400, sx = {} }) => {
  const [local, setLocal] = useState(externalValue || '');

  useEffect(() => {
    setLocal(externalValue || '');
  }, [externalValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== (externalValue || '')) {
        onChange?.(local);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [local]);

  return (
    <TextField
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder={placeholder}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment>
        ),
        sx: { borderRadius: 2, bgcolor: '#FFFFFF', '& fieldset': { borderColor: '#E5E7EB' } },
      }}
      sx={{ minWidth: 280, ...sx }}
    />
  );
};

export default SearchBar;

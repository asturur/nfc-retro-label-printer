import type { JSX } from 'react';
import { useCallback } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { templates } from '../cardsTemplates';
import { useAppDataContext } from '../contexts/appData';

const TemplateDropdown = (): JSX.Element => {
  const { templateKey, setTemplate, setTemplateKey } = useAppDataContext();
  const toggleTemplate = useCallback(
    async (evt: SelectChangeEvent<string>) => {
      const value = evt.target.value;
      const template = templates[value];
      setTemplateKey(value);
      setTemplate(template);
    },
    [setTemplate, setTemplateKey],
  );

  return (
    <FormControl size="small" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="template-select" sx={{ fontWeight: 400 }}>
        Card template
      </InputLabel>
      <Select
        labelId="template-select"
        value={templateKey}
        label="Card template"
        onChange={toggleTemplate}
        sx={{ fontWeight: 400 }}
      >
        {Object.entries(templates).map(([key, value]) => (
          <MenuItem
            key={key}
            value={key}
            selected={key === templateKey}
            sx={{ fontWeight: 400 }}
          >
            {value.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TemplateDropdown;

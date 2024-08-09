import type { JSX } from 'react';
import { useCallback } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { templates } from '../cardsTemplates';
import { useAppDataContext } from '../contexts/appData';
import type { templateType } from '../resourcesTypedef';

type TemplateDropdownProps = {
  id: string;
  template: templateType;
};

const TemplateDropdown = ({
  id = 'header-dropdown',
  template,
}: TemplateDropdownProps): JSX.Element => {
  const { setTemplate } = useAppDataContext();
  const toggleTemplate = useCallback(
    async (evt: SelectChangeEvent<string>) => {
      const value = evt.target.value;
      const chosenTemplate = templates[value];
      setTemplate(chosenTemplate);
    },
    [setTemplate],
  );

  const currentKey = Object.entries(templates).find(
    ([, value]) => value === template,
  )?.[0];

  return (
    <FormControl size="small" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id={id} htmlFor={`${id}-select`} sx={{ fontWeight: 400 }}>
        Card template
      </InputLabel>
      <Select
        id={`${id}-select`}
        labelId={id}
        label="Card template"
        value={currentKey}
        onChange={toggleTemplate}
        sx={{ fontWeight: 400 }}
      >
        {Object.entries(templates).map(([key, value]) => (
          <MenuItem
            key={key}
            value={key}
            selected={value === template}
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

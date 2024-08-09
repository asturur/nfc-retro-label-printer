import { type FabricObject } from 'fabric';
import { type TemplateEdit } from '../resourcesTypedef';
import { Typography } from '@mui/material';
import './ResourceDisplay.css';
import { processCustomizations } from '../utils/processCustomizations';

type ResourceDisplayProps = {
  resource?: TemplateEdit;
  target?: FabricObject;
  className: string;
  setCurrentResource: (arg0: [TemplateEdit, FabricObject] | undefined) => void;
};

const clickSwap = async (
  src: string,
  target: FabricObject,
  resource: TemplateEdit,
  setCurrentResource: (arg0: [TemplateEdit, FabricObject] | undefined) => void,
) => {
  const canvas = target.canvas!;
  const insertedObject = await processCustomizations(canvas, [resource], src);
  if (insertedObject) {
    // delete the old image
    (target.parent || canvas).remove(target);
    setCurrentResource([resource, insertedObject]);
  }
};

export const ResourceDisplay = ({
  resource,
  target,
  className,
  setCurrentResource,
}: ResourceDisplayProps) => {
  if (!resource || !target) {
    return null;
  }

  return (
    <div className={className}>
      {resource.resource.data.map(({ label, value }) => {
        return (
          <div
            className="resourceItem"
            onClick={() =>
              clickSwap(value, target, resource, setCurrentResource)
            }
          >
            <img src={value} />
            <Typography>{label}</Typography>
          </div>
        );
      })}
    </div>
  );
};

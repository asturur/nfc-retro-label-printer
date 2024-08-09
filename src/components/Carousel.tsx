import Typography from '@mui/material/Typography';
import { templates } from '../cardsTemplates';
import './Carousel.css';
import { useAppDataContext } from '../contexts/appData';
import { useFileAdder } from '../hooks/useFileAdder';
import { templateAuthors } from '../templateAuthors';
import type { templateType } from '../resourcesTypedef';

const TemplatesCarousel = () => {
  const { setTemplate } = useAppDataContext();
  const { inputElement, openInputFile } = useFileAdder();
  const items = Object.entries(templates)
    .map<templateType & { key: string }>(([key, value]) => ({
      ...value,
      key,
    }))
    .filter(
      (tData) =>
        (!!tData.overlay || !!tData.background) && !tData.key.includes('blank'),
    );

  return (
    <>
      {inputElement}
      <Typography variant="h3" color="primary">
        Click a template from the {items.length} availables to get started:
      </Typography>
      <div className="carousel-container">
        <div className="carousel-scroll">
          {items.map((tData) => (
            <div
              className="carouselItem-externals"
              onDragStart={(e) => {
                e.preventDefault();
                return false;
              }}
              key={tData.key}
            >
              <div
                className={`carouselItem ${tData.layout}`}
                key={tData.key}
                onClick={() => {
                  setTemplate(tData);
                  openInputFile();
                }}
              >
                {tData.background && <img src={tData.background.url} />}
                {tData.overlay && <img src={tData.overlay.url} />}
              </div>
              <Typography className="carouselCaption">
                {tData.label}
                <br />
                by
                <br />
                {templateAuthors[tData.author].name}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TemplatesCarousel;

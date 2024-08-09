import { LabelEditor } from './LabelEditor';
import { DataToCanvasReconciler } from './DataToCanvasReconciler';
import { useFileDropperContext } from '../contexts/fileDropper';
import './LabelsView.css';
import { SmallDropZone } from './SmallDropZone';
import { SingleCardEditModal } from './SingleCardEditModal';
import { useSingleEditModal } from '../hooks/useSingleEditModal';

export const LabelsView = () => {
  const { cards } = useFileDropperContext();
  const { isOpen, onClose, setCardToEdit, currentCardIndex } =
    useSingleEditModal();
  return (
    <div className="labelsView">
      {cards.current.map((card, index) => (
        <LabelEditor
          setCardToEdit={setCardToEdit}
          className="labelContainer horizontal"
          key={card.key}
          index={index}
          card={card}
        />
      ))}
      <SmallDropZone className="labelContainer horizontal" />
      <DataToCanvasReconciler />
      <SingleCardEditModal
        isOpen={isOpen}
        onClose={onClose}
        currentCardIndex={currentCardIndex}
      />
    </div>
  );
};

export default LabelsView;

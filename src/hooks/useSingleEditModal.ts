import { useCallback, useState } from 'react';

type UseSingleEditModalValue = {
  isOpen: boolean;
  onClose: () => void;
  setCardToEdit: (arg: number) => void;
  currentCardIndex: number;
}

export const useSingleEditModal = (): UseSingleEditModalValue => {

  const [currentCardIndex, setCardToEdit] = useState<number>(-1);
  const onClose = useCallback(() => {
    setCardToEdit(-1);
  }, [setCardToEdit]);

  return {
    isOpen: currentCardIndex > -1,
    onClose,
    setCardToEdit,
    currentCardIndex,
  }
}
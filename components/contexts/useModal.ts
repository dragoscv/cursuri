import { useCallback } from 'react';

export function useModal(dispatch: React.Dispatch<any>) {
    const openModal = useCallback((props: any) => {
        dispatch({ type: 'ADD_MODAL', payload: props });
    }, [dispatch]);

    const closeModal = useCallback((id: string) => {
        dispatch({ type: 'CLOSE_MODAL', payload: id });
    }, [dispatch]);

    const updateModal = useCallback((props: any) => {
        dispatch({ type: 'UPDATE_MODAL', payload: props });
    }, [dispatch]);

    return { openModal, closeModal, updateModal };
}

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Guardias from './Guardias';
import guardiaService from '../../services/guardiaService';
import Swal from 'sweetalert2';

// Mocks
vi.mock('../../services/guardiaService');
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
        mixin: vi.fn(),
    },
}));
vi.mock('../../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>,
}));
vi.mock('../../components/RequirePermission', () => ({
    default: ({ children }) => <>{children}</>,
}));

const mockGuards = [
    {
        id: 1,
        nombre: 'Guardia Test 1',
        rut: '12.345.678-9',
        activo_app: true,
    },
    {
        id: 2,
        nombre: 'Guardia Test 2',
        rut: '98.765.432-1',
        activo_app: false,
    },
];

describe('Guardias Component - Delete Functionality', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        guardiaService.getAll.mockResolvedValue(mockGuards);
    });

    it('Scenario 1: Clicking "No" (Cancel) does not delete', async () => {
        Swal.fire.mockResolvedValue({ isConfirmed: false });

        render(<Guardias />);

        await waitFor(() => {
            expect(screen.getByText('Guardia Test 1')).toBeInTheDocument();
        });

        const card = screen.getByText('Guardia Test 1').closest('div.group');
        const deleteBtn = card.querySelector('button.hover\\:text-red-600'); 
        
        fireEvent.click(deleteBtn);

        expect(Swal.fire).toHaveBeenCalled();
        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            title: '¿Está seguro de eliminar esta guardia?',
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }));

        expect(guardiaService.remove).not.toHaveBeenCalled();
    });

    it('Scenario 2: Clicking "Sí" (Confirm) deletes successfully', async () => {
        Swal.fire.mockResolvedValue({ isConfirmed: true });
        guardiaService.remove.mockResolvedValue({});
        const toastFire = vi.fn();
        Swal.mixin.mockReturnValue({ fire: toastFire });

        render(<Guardias />);

        await waitFor(() => {
            expect(screen.getByText('Guardia Test 1')).toBeInTheDocument();
        });

        const card = screen.getByText('Guardia Test 1').closest('div.group');
        const deleteBtn = card.querySelector('button.hover\\:text-red-600');

        fireEvent.click(deleteBtn);

        // Verify Swal call
        expect(Swal.fire).toHaveBeenCalled();

        // Verify remove was called
        await waitFor(() => {
            expect(guardiaService.remove).toHaveBeenCalledWith(1);
        });

        // Verify Toast success
        await waitFor(() => {
            expect(toastFire).toHaveBeenCalledWith({
                icon: 'success',
                title: 'Guardia eliminada correctamente'
            });
        });

        // Verify guard is removed from list
        expect(screen.queryByText('Guardia Test 1')).not.toBeInTheDocument();
    });

    it('Scenario 3: Clicking "Sí" (Confirm) with error handles it gracefully', async () => {
        const user = userEvent.setup();
        Swal.fire.mockResolvedValue({ isConfirmed: true });
        guardiaService.remove.mockRejectedValue(new Error('Server Error'));
        const toastFire = vi.fn();
        Swal.mixin.mockReturnValue({ fire: toastFire });

        render(<Guardias />);

        await waitFor(() => {
            expect(screen.getByText('Guardia Test 1')).toBeInTheDocument();
        });

        const card = screen.getByText('Guardia Test 1').closest('div.group');
        const deleteBtn = card.querySelector('button.hover\\:text-red-600');

        await user.click(deleteBtn);

        // Verify remove was called
        await waitFor(() => {
            expect(guardiaService.remove).toHaveBeenCalledWith(1);
        });

        // Verify Error Swal
        await waitFor(() => {
             // Find if any call matches the expected error arguments
             const errorCall = Swal.fire.mock.calls.find(call => 
                 call[0] === 'Error' && 
                 call[1] === 'No se pudo eliminar la guardia' && 
                 call[2] === 'error'
             );
             expect(errorCall).toBeTruthy();
        });

        // Verify guard is STILL in list
        expect(screen.getByText('Guardia Test 1')).toBeInTheDocument();
    });
});

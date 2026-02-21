import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Blacklist from './Blacklist';
import blacklistService from '../../services/blacklistService';
import Swal from 'sweetalert2';

vi.mock('../../services/blacklistService');
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
    },
}));
vi.mock('../../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>,
}));
vi.mock('../../components/RequirePermission', () => ({
    default: ({ children }) => <>{children}</>,
}));

const mockBlacklist = [
    {
        id: 1,
        nombre: 'REYES GUAJARDO IVAN',
        rut: '16.691.893-6',
        recintos: 'FSP PLAZA DE ARMAS',
        fecha_bloqueo: '2024-09-01',
        motivo: 'NO REUNE PERFIL',
    },
    {
        id: 2,
        nombre: 'Persona Extra',
        rut: '22.222.222-2',
        recintos: 'Otro',
        fecha_bloqueo: '2026-01-02',
        motivo: 'Otro motivo',
    },
];

describe('Blacklist Component - Búsqueda por nombre y RUT', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        blacklistService.getAll.mockResolvedValue(mockBlacklist);
    });

    it('encuentra a "Iván Reyes" al buscar por nombre sin acento', async () => {
        const user = userEvent.setup();

        render(<Blacklist />);

        await waitFor(() => {
            expect(screen.getByText('REYES GUAJARDO IVAN')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Buscar por RUT o nombre');

        await user.clear(input);
        await user.type(input, 'Ivan Reyes');

        await waitFor(() => {
            expect(screen.getByText('REYES GUAJARDO IVAN')).toBeInTheDocument();
        });
    });

    it('encuentra registro al buscar por RUT con formato', async () => {
        const user = userEvent.setup();

        render(<Blacklist />);

        await waitFor(() => {
            expect(screen.getByText('REYES GUAJARDO IVAN')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Buscar por RUT o nombre');

        await user.clear(input);
        await user.type(input, '16.691.893-6');

        await waitFor(() => {
            expect(screen.getByText('REYES GUAJARDO IVAN')).toBeInTheDocument();
        });
    });

    it('permite buscar por combinación parcial de nombre y apellido en distinto orden', async () => {
        const user = userEvent.setup();

        render(<Blacklist />);

        await waitFor(() => {
            expect(screen.getByText('REYES GUAJARDO IVAN')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Buscar por RUT o nombre');

        await user.clear(input);
        await user.type(input, 'Ivan Reyes');

        await waitFor(() => {
            expect(screen.getByText('REYES GUAJARDO IVAN')).toBeInTheDocument();
        });
    });
});

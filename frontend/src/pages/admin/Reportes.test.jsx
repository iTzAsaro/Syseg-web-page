import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Reportes from './Reportes';
import reporteService from '../../services/reporteService';
import React from 'react';

// Mocks
vi.mock('../../services/reporteService');
vi.mock('../../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

// Mock Recharts ResponsiveContainer to render children immediately
// Recharts uses resize observers which can be tricky in JSDOM
vi.mock('recharts', async () => {
    const OriginalModule = await vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => (
            <div className="recharts-responsive-container" style={{ width: '100%', height: '100%' }}>
                {children}
            </div>
        ),
    };
});

describe('Reportes Component', () => {
    const mockData = {
        activityData: [
            { day: 'Lun', rawDate: '2023-10-01', ingresos: 100, retiros: 50 },
            { day: 'Mar', rawDate: '2023-10-02', ingresos: 200, retiros: 150 },
        ],
        topItems: [
            { name: 'Item 1', cat: 'Cat 1', count: 100, max: 120 }
        ],
        topUsers: [
            { name: 'User 1', role: 'Admin', count: 5, transactions: 10 },
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería mostrar loading inicialmente', () => {
        reporteService.getDashboardStats.mockReturnValue(new Promise(() => {})); // Never resolves
        render(<Reportes />);
        expect(screen.getByText('Cargando métricas...')).toBeInTheDocument();
    });

    it('debería renderizar el gráfico con datos reales cuando existen', async () => {
        reporteService.getDashboardStats.mockResolvedValue(mockData);
        
        render(<Reportes />);

        await waitFor(() => {
            expect(screen.queryByText('Cargando métricas...')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Reportes')).toBeInTheDocument();
        expect(screen.getByText('Actividad Financiera')).toBeInTheDocument();
        
        // Verificar que se llame al servicio
        expect(reporteService.getDashboardStats).toHaveBeenCalledTimes(1);
    });

    it('debería mostrar error si falla la carga', async () => {
        reporteService.getDashboardStats.mockRejectedValue(new Error('Network Error'));
        
        render(<Reportes />);

        await waitFor(() => {
            expect(screen.getByText('Error de Conexión')).toBeInTheDocument();
            expect(screen.getByText('No se pudo conectar con el servidor de reportes.')).toBeInTheDocument();
        });

        // Verificar botón de reintentar
        const retryBtn = screen.getByText('Reintentar');
        fireEvent.click(retryBtn);
        expect(reporteService.getDashboardStats).toHaveBeenCalledTimes(2);
    });

    it('debería usar datos simulados (mock) cuando no hay datos reales', async () => {
        // Simular respuesta vacía o ceros
        reporteService.getDashboardStats.mockResolvedValue({
            activityData: [],
            topItems: [],
            topUsers: []
        });

        render(<Reportes />);

        await waitFor(() => {
            expect(screen.queryByText('Cargando métricas...')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Actividad Financiera')).toBeInTheDocument();
        // Verificar que aparezca la sección de Top Productos (Mes) aunque esté vacía
        expect(screen.getByText('Más Solicitados (Mes)')).toBeInTheDocument();
        expect(screen.getByText('No hay datos de productos este mes')).toBeInTheDocument();
        // Verificar componente Top Usuarios
        expect(screen.getByText('Usuarios Destacados')).toBeInTheDocument();
    });
});

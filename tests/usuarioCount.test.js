const { buscarTodos } = require('../controllers/usuarioController');
const { Usuario, Rol, Permiso } = require('../models');

// Mock req and res
const mockRequest = (query) => ({
    query
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

// Mock Sequelize models
jest.mock('../models', () => ({
    Usuario: {
        findAndCountAll: jest.fn()
    },
    Rol: {},
    Permiso: {}
}));

describe('usuarioController.buscarTodos', () => {
    it('should use distinct: true in findAndCountAll to avoid duplicate counts', async () => {
        const req = mockRequest({ page: 1, limit: 10 });
        const res = mockResponse();

        // Mock return value
        Usuario.findAndCountAll.mockResolvedValue({
            count: 21,
            rows: [{ id: 1, nombre: 'Test User' }]
        });

        await buscarTodos(req, res);

        // Verify findAndCountAll was called with distinct: true
        expect(Usuario.findAndCountAll).toHaveBeenCalledWith(
            expect.objectContaining({
                distinct: true,
                include: expect.any(Array)
            })
        );

        // Verify response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                totalItems: 21
            })
        );
    });
});

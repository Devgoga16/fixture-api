const SuperAdmin = require('../models/SuperAdmin');

class SuperAdminController {
  /**
   * POST /api/superadmins
   * Crear un nuevo superadmin
   */
  static async createSuperAdmin(req, res) {
    try {
      const { name, phone } = req.body;

      // Validaciones
      if (!name || !phone) {
        return res.status(400).json({
          error: 'Se requiere nombre y teléfono'
        });
      }

      const superAdmin = new SuperAdmin({
        name,
        phone
      });

      await superAdmin.save();

      res.status(201).json({
        id: superAdmin._id,
        name: superAdmin.name,
        phone: superAdmin.phone,
        createdAt: superAdmin.createdAt
      });
    } catch (error) {
      console.error('Error creating superadmin:', error);
      
      // Manejar error de teléfono duplicado
      if (error.code === 11000) {
        return res.status(400).json({ 
          error: 'El número de teléfono ya está registrado' 
        });
      }
      
      res.status(500).json({ error: 'Error al crear superadmin' });
    }
  }

  /**
   * GET /api/superadmins
   * Listar todos los superadmins
   */
  static async listSuperAdmins(req, res) {
    try {
      const superAdmins = await SuperAdmin.find().sort({ createdAt: -1 });

      const superAdminsFormatted = superAdmins.map(admin => ({
        id: admin._id,
        name: admin.name,
        phone: admin.phone,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }));

      res.json(superAdminsFormatted);
    } catch (error) {
      console.error('Error listing superadmins:', error);
      res.status(500).json({ error: 'Error al listar superadmins' });
    }
  }

  /**
   * GET /api/superadmins/:id
   * Obtener un superadmin específico
   */
  static async getSuperAdmin(req, res) {
    try {
      const { id } = req.params;

      const superAdmin = await SuperAdmin.findById(id);
      if (!superAdmin) {
        return res.status(404).json({ error: 'Superadmin no encontrado' });
      }

      res.json({
        id: superAdmin._id,
        name: superAdmin.name,
        phone: superAdmin.phone,
        createdAt: superAdmin.createdAt,
        updatedAt: superAdmin.updatedAt
      });
    } catch (error) {
      console.error('Error getting superadmin:', error);
      res.status(500).json({ error: 'Error al obtener superadmin' });
    }
  }

  /**
   * PUT /api/superadmins/:id
   * Actualizar un superadmin
   */
  static async updateSuperAdmin(req, res) {
    try {
      const { id } = req.params;
      const { name, phone } = req.body;

      if (!name && !phone) {
        return res.status(400).json({
          error: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      const superAdmin = await SuperAdmin.findById(id);
      if (!superAdmin) {
        return res.status(404).json({ error: 'Superadmin no encontrado' });
      }

      if (name) superAdmin.name = name;
      if (phone) superAdmin.phone = phone;

      await superAdmin.save();

      res.json({
        id: superAdmin._id,
        name: superAdmin.name,
        phone: superAdmin.phone,
        updatedAt: superAdmin.updatedAt
      });
    } catch (error) {
      console.error('Error updating superadmin:', error);
      res.status(500).json({ error: 'Error al actualizar superadmin' });
    }
  }

  /**
   * DELETE /api/superadmins/:id
   * Eliminar un superadmin
   */
  static async deleteSuperAdmin(req, res) {
    try {
      const { id } = req.params;

      const superAdmin = await SuperAdmin.findById(id);
      if (!superAdmin) {
        return res.status(404).json({ error: 'Superadmin no encontrado' });
      }

      await superAdmin.deleteOne();

      res.json({ message: 'Superadmin eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting superadmin:', error);
      res.status(500).json({ error: 'Error al eliminar superadmin' });
    }
  }
}

module.exports = SuperAdminController;

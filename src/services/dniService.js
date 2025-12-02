const axios = require('axios');

class DniService {
  /**
   * Consulta información de una persona por DNI usando la API de apis.net.pe
   * @param {string} dni - Número de DNI a consultar
   * @returns {Object} - Información de la persona
   */
  static async consultarDni(dni) {
    try {
      const apiToken = process.env.APIS_NET_PE_TOKEN;
      
      if (!apiToken) {
        throw new Error('Token de API no configurado. Configura APIS_NET_PE_TOKEN en .env');
      }

      const response = await axios.get(`https://api.apis.net.pe/v1/dni`, {
        params: {
          numero: dni
        },
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        }
      });

      return {
        success: true,
        data: {
          fullName: response.data.nombre,
          dni: response.data.numeroDocumento,
          firstName: response.data.nombres,
          lastName: `${response.data.apellidoPaterno} ${response.data.apellidoMaterno}`,
          apellidoPaterno: response.data.apellidoPaterno,
          apellidoMaterno: response.data.apellidoMaterno,
          nombres: response.data.nombres,
          tipoDocumento: response.data.tipoDocumento,
          raw: response.data
        }
      };
    } catch (error) {
      if (error.response) {
        // Error de la API externa
        return {
          success: false,
          error: 'Error al consultar DNI',
          message: error.response.data?.message || 'DNI no encontrado o inválido',
          statusCode: error.response.status
        };
      }
      
      // Error de conexión u otro
      return {
        success: false,
        error: 'Error de conexión',
        message: error.message
      };
    }
  }
}

module.exports = DniService;

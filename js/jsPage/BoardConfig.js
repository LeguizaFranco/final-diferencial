// BoardConfig.js - Nueva clase para gestionar configuraciones de tableros
class BoardConfig {
    /**
     * Retorna las configuraciones de tableros disponibles.
     * Cada tablero tiene:
     * - name: nombre descriptivo
     * - grid: tamaño de la matriz (filas x columnas)
     * - layout: función que retorna la matriz del tablero
     */
    static getConfigs() {
        return {
            'cross': {
                name: 'Cruz Clásica',
                rows: 7,
                cols: 7,
                layout: (PegClass, pegImg) => [
                    [-1, -1, new PegClass(0, 2, pegImg), new PegClass(0, 3, pegImg), new PegClass(0, 4, pegImg), -1, -1],
                    [-1, -1, new PegClass(1, 2, pegImg), new PegClass(1, 3, pegImg), new PegClass(1, 4, pegImg), -1, -1],
                    [new PegClass(2, 0, pegImg), new PegClass(2, 1, pegImg), new PegClass(2, 2, pegImg), new PegClass(2, 3, pegImg), new PegClass(2, 4, pegImg), new PegClass(2, 5, pegImg), new PegClass(2, 6, pegImg)],
                    [new PegClass(3, 0, pegImg), new PegClass(3, 1, pegImg), new PegClass(3, 2, pegImg), null, new PegClass(3, 4, pegImg), new PegClass(3, 5, pegImg), new PegClass(3, 6, pegImg)],
                    [new PegClass(4, 0, pegImg), new PegClass(4, 1, pegImg), new PegClass(4, 2, pegImg), new PegClass(4, 3, pegImg), new PegClass(4, 4, pegImg), new PegClass(4, 5, pegImg), new PegClass(4, 6, pegImg)],
                    [-1, -1, new PegClass(5, 2, pegImg), new PegClass(5, 3, pegImg), new PegClass(5, 4, pegImg), -1, -1],
                    [-1, -1, new PegClass(6, 2, pegImg), new PegClass(6, 3, pegImg), new PegClass(6, 4, pegImg), -1, -1]
                ]
            },
            // En BoardConfig.js, reemplaza 'largeCross' por 'circle':

            'circle': {
                name: 'Círculo',
                rows: 7,
                cols: 7,
                layout: (PegClass, pegImg) => [
                    [-1, -1, new PegClass(0, 2, pegImg), new PegClass(0, 3, pegImg), new PegClass(0, 4, pegImg), -1, -1],
                    [-1, new PegClass(1, 1, pegImg), new PegClass(1, 2, pegImg), new PegClass(1, 3, pegImg), new PegClass(1, 4, pegImg), new PegClass(1, 5, pegImg), -1],
                    [new PegClass(2, 0, pegImg), new PegClass(2, 1, pegImg), new PegClass(2, 2, pegImg), new PegClass(2, 3, pegImg), new PegClass(2, 4, pegImg), new PegClass(2, 5, pegImg), new PegClass(2, 6, pegImg)],
                    [new PegClass(3, 0, pegImg), new PegClass(3, 1, pegImg), new PegClass(3, 2, pegImg), null, new PegClass(3, 4, pegImg), new PegClass(3, 5, pegImg), new PegClass(3, 6, pegImg)],
                    [new PegClass(4, 0, pegImg), new PegClass(4, 1, pegImg), new PegClass(4, 2, pegImg), new PegClass(4, 3, pegImg), new PegClass(4, 4, pegImg), new PegClass(4, 5, pegImg), new PegClass(4, 6, pegImg)],
                    [-1, new PegClass(5, 1, pegImg), new PegClass(5, 2, pegImg), new PegClass(5, 3, pegImg), new PegClass(5, 4, pegImg), new PegClass(5, 5, pegImg), -1],
                    [-1, -1, new PegClass(6, 2, pegImg), new PegClass(6, 3, pegImg), new PegClass(6, 4, pegImg), -1, -1]
                ]
            },
            'square': {
                name: 'Cuadrado',
                rows: 7,
                cols: 7,
                layout: (PegClass, pegImg) => [
                    [new PegClass(0, 0, pegImg), new PegClass(0, 1, pegImg), new PegClass(0, 2, pegImg), new PegClass(0, 3, pegImg), new PegClass(0, 4, pegImg), new PegClass(0, 5, pegImg), new PegClass(0, 6, pegImg)],
                    [new PegClass(1, 0, pegImg), new PegClass(1, 1, pegImg), new PegClass(1, 2, pegImg), new PegClass(1, 3, pegImg), new PegClass(1, 4, pegImg), new PegClass(1, 5, pegImg), new PegClass(1, 6, pegImg)],
                    [new PegClass(2, 0, pegImg), new PegClass(2, 1, pegImg), new PegClass(2, 2, pegImg), new PegClass(2, 3, pegImg), new PegClass(2, 4, pegImg), new PegClass(2, 5, pegImg), new PegClass(2, 6, pegImg)],
                    [new PegClass(3, 0, pegImg), new PegClass(3, 1, pegImg), new PegClass(3, 2, pegImg), null, new PegClass(3, 4, pegImg), new PegClass(3, 5, pegImg), new PegClass(3, 6, pegImg)],
                    [new PegClass(4, 0, pegImg), new PegClass(4, 1, pegImg), new PegClass(4, 2, pegImg), new PegClass(4, 3, pegImg), new PegClass(4, 4, pegImg), new PegClass(4, 5, pegImg), new PegClass(4, 6, pegImg)],
                    [new PegClass(5, 0, pegImg), new PegClass(5, 1, pegImg), new PegClass(5, 2, pegImg), new PegClass(5, 3, pegImg), new PegClass(5, 4, pegImg), new PegClass(5, 5, pegImg), new PegClass(5, 6, pegImg)],
                    [new PegClass(6, 0, pegImg), new PegClass(6, 1, pegImg), new PegClass(6, 2, pegImg), new PegClass(6, 3, pegImg), new PegClass(6, 4, pegImg), new PegClass(6, 5, pegImg), new PegClass(6, 6, pegImg)]
                ]
            }
        };
    }

    /**
     * Obtiene una configuración específica por su clave
     */
    static getConfig(boardType) {
        const configs = this.getConfigs();
        return configs[boardType] || configs['cross'];
    }
}
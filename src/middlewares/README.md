
# RESUMEN DE MIDDLEWARES

## ✔ allowRoles

Este middleware permite asignar los roles que pueden acceder a determinado endpoint.

### Uso

```javascript
const { allowRoles } = require('../middlewares/allowRoles');

router.get('/ruta', allowRoles(['admin', 'user']), (req, res) => {
    // ...
});
```

## ✔ checkAuth

Este middleware permite filtrar las rutas que pueden ser accedidas por un usuario autenticado.

**Importante:** Este middleware agrega a la request los parametros userId y userRole.

### Uso

```javascript
const { checkAuth } = require('../middlewares/checkAuth');

router.get('/ruta', checkAuth, (req, res) => {
    // ...
});
```

## ✔ validateURLParams

Este middleware permite validar los parámetros de una URL.

### Uso

```javascript
const { validateURLParams } = require('../middlewares/validateURLParams');

router.get('/ruta/:id', validateURLParams(['id']), (req, res) => {
    // ...
});
```
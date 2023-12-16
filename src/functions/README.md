# RESUMEN DE FUNCIONES

## ✔ createJWT

Esta función permite crear un JWT.

### Uso

```javascript
const { createJWT } = require('../functions/createJWT');

const payload = {
    userId: '1234567890',
    userRole: 'admin'
};

const token = createJWT(payload);
```

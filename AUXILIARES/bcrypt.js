import bcrypt from 'bcrypt';

// export async function hashPassword(password) {
//     // Genera un salt (valor aleatorio) y luego hashea la contraseña con el salt
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     return hashedPassword;
// }

// Ejemplo de uso
// hashPassword('mi_contraseña').then((hashedPassword) => {
//     console.log('Contraseña hasheada:', hashedPassword);
// });


// uso para creacion de contraseñas encriptadas

bcrypt.hash('admin', 10, function(err, hash) {
    console.log(hash);
});

// Supongamos que `storedPassword` es la contraseña almacenada en tu base de datos
// const storedPassword = 'hash_generado_anteriormente'; // Recupera esto de tu base de datos

// Compara la contraseña ingresada con la almacenada en la base de datos
// bcrypt.compare('contraseña_ingresada', storedPassword, (err, result) => {
//     if (result) {
//         console.log('Contraseña válida');
//     } else {
//         console.log('Contraseña inválida');
//     }
// });

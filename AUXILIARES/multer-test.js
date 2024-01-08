
// Endpoint para cargar un archivo PDF - tests
router.post(
    '/upload-pdf',
    upload.single('pdfFile'),
    (req, res) => {
        try {
            /*
             {
             fieldname: 'pdfFile',
             originalname: 'exampleName.pdf',
             encoding: '7bit',
             mimetype: 'application/pdf',
             destination: 'uploads/docs',
             filename: 'exampleName-1704677039044-679157975.pdf',
             path: 'uploads\\docs\\MarcoBardalesRodriguez_CurriculumPracticas-1704677039044-679157975.pdf',
             size: 165502
             }
             */
            console.log(req.file)

            res.status(200).send('Archivo PDF cargado con éxito');
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message, code: 'internal_server_error' });
        }
    }
);